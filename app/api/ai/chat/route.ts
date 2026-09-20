import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // Build Gemini contents payload (translating 'assistant' to 'model')
    const contents = messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemPrompt =
      'You are GlobeTrotter AI Copilot, a helpful, enthusiastic, and knowledgeable travel assistant. ' +
      'Answer questions directly: give real local food suggestions, hidden spots, budget breakdowns, best seasons to visit, travel tips, and comparisons. ' +
      'Keep responses concise (1-3 short paragraphs or bullet points, max 160 words). ' +
      'If you identify a specific primary destination being discussed, append "[Destination: <Name>]" at the very end of your response.';

    // 1. Try Gemini 2.5 Flash
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: 400,
                temperature: 0.7,
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let suggestedDestination: string | null = null;

          // Extract [Destination: ...] tag if present
          const destMatch = replyText.match(/\[Destination:\s*([^\]]+)\]/i);
          if (destMatch) {
            suggestedDestination = destMatch[1].trim();
            replyText = replyText.replace(/\[Destination:\s*[^\]]+\]/gi, '').trim();
          }

          return NextResponse.json({
            reply: replyText,
            suggestedDestination,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini chat failed, trying Groq fallback:', geminiErr);
      }
    }

    // 2. Try Groq fallback
    if (groqKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.7,
            max_tokens: 350,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          let replyText = data.choices?.[0]?.message?.content || '';
          let suggestedDestination: string | null = null;

          const destMatch = replyText.match(/\[Destination:\s*([^\]]+)\]/i);
          if (destMatch) {
            suggestedDestination = destMatch[1].trim();
            replyText = replyText.replace(/\[Destination:\s*[^\]]+\]/gi, '').trim();
          }

          return NextResponse.json({
            reply: replyText,
            suggestedDestination,
          });
        }
      } catch (groqErr) {
        console.warn('Groq chat failed:', groqErr);
      }
    }

    // 3. Graceful fallback
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    return NextResponse.json({
      reply: `I'd love to help you plan your travel for "${lastUserMsg}". Ask me about must-see spots, estimated budgets, local food, or click below to build a full custom itinerary!`,
      suggestedDestination: null,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Chat service error' }, { status: 500 });
  }
}
