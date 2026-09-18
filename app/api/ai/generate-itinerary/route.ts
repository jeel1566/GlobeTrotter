import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';
import { generateItinerary } from '@/lib/ai/itinerary-generator';

const DAILY_AI_CAP = 15;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Check daily cap
    const today = new Date().toISOString().split('T')[0];
    const resetDate = user.ai_generations_reset_at
      ? new Date(user.ai_generations_reset_at).toISOString().split('T')[0]
      : today;

    let generationsToday = user.ai_generations_today || 0;
    if (resetDate !== today) {
      generationsToday = 0;
      await supabaseServer
        .from('users')
        .update({
          ai_generations_today: 0,
          ai_generations_reset_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    if (generationsToday >= DAILY_AI_CAP) {
      return NextResponse.json(
        {
          error: `Daily AI generation limit (${DAILY_AI_CAP}) reached. Please try again tomorrow.`,
          code: 'AI_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      destination,
      days = 3,
      budget = 20000,
      interests = [],
      trip_id = null,
    } = body;

    if (!destination || !destination.trim()) {
      return NextResponse.json(
        { error: 'Destination is required for AI generation', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const safeDays = Math.min(Math.max(Number(days) || 1, 1), 10);
    const safeBudget = Math.max(Number(budget) || 0, 0);

    // Call Generator (handles 8s circuit-breaker & fallbacks internally)
    const result = await generateItinerary({
      destination: destination.trim(),
      days: safeDays,
      budget: safeBudget,
      interests: Array.isArray(interests) ? interests : [],
    });

    // Increment user's count & log generation
    await supabaseServer
      .from('users')
      .update({ ai_generations_today: generationsToday + 1 })
      .eq('id', user.id);

    try {
      await supabaseServer.from('ai_generation_log').insert({
        user_id: user.id,
        trip_id: trip_id || null,
        input_params: { destination, days: safeDays, budget: safeBudget, interests },
        used_fallback: result.fallback,
      });
    } catch (logErr) {
      // Non-critical logging failure
    }

    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
