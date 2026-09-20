export interface ParsedTripPrompt {
  destination: string;
  days: number;
  budget: number;
  cleanedPrompt: string;
}

/**
 * Parses natural language travel queries like:
 * "7 days in bali in 70k" -> { destination: "Bali", days: 7, budget: 70000 }
 * "weekend trip to Goa under 30000" -> { destination: "Goa", days: 3, budget: 30000 }
 * "10 days in Japan around 1.5L" -> { destination: "Japan", days: 10, budget: 150000 }
 */
export function parseTripPrompt(rawPrompt: string): ParsedTripPrompt {
  if (!rawPrompt || !rawPrompt.trim()) {
    return {
      destination: 'Tokyo, Japan',
      days: 7,
      budget: 80000,
      cleanedPrompt: '',
    };
  }

  const prompt = rawPrompt.trim();
  let days = 7;
  let budget = 80000;

  // 1. Extract days: "7 days", "7days", "7d", "weekend" (3 days)
  const daysMatch = prompt.match(/\b(\d{1,2})\s*(?:days?|d\b)/i);
  if (daysMatch) {
    const d = parseInt(daysMatch[1], 10);
    if (d > 0 && d <= 30) {
      days = d;
    }
  } else if (/\bweekend\b/i.test(prompt)) {
    days = 3;
  } else if (/\b2\s*weeks?\b/i.test(prompt)) {
    days = 14;
  } else if (/\bweek\b/i.test(prompt)) {
    days = 7;
  }

  // 2. Extract budget: "70k", "80000", "1.5L", "1.5 lakh", "₹50k", "$2000"
  const lakhMatch = prompt.match(/(?:in|under|budget|for|approx|around|₹|\$)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|l\b)/i);
  const kMatch = prompt.match(/(?:in|under|budget|for|approx|around|₹|\$)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  const rawNumBudgetMatch = prompt.match(/(?:in|under|budget|for|approx|around|₹|\$)\s*(\d{4,7})\b/i);

  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val) && val > 0) {
      budget = Math.round(val * 100000);
    }
  } else if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val) && val > 0) {
      budget = Math.round(val * 1000);
    }
  } else if (rawNumBudgetMatch) {
    const val = parseInt(rawNumBudgetMatch[1], 10);
    if (!isNaN(val) && val >= 1000) {
      budget = val;
    }
  }

  // 3. Extract destination by stripping out days, budgets, and prepositions
  let clean = prompt;
  clean = clean.replace(/\b\d{1,2}\s*(?:days?|d\b)/gi, ' ');
  clean = clean.replace(/\b(?:weekend|week|2\s*weeks?)\b/gi, ' ');
  clean = clean.replace(/(?:in|under|budget|for|approx|around|costing|with)?\s*(?:₹|\$)?\s*\d+(?:\.\d+)?\s*(?:lakhs?|lac|l|k|thousand)?\b/gi, ' ');
  clean = clean.replace(/(?:in|under|budget|for|approx|around)?\s*(?:₹|\$)\s*[\d,]+/gi, ' ');
  clean = clean.replace(/\b(?:trip\s+to|journey\s+to|vacation\s+to|travel\s+to|visit\s+to|explore|tour|trip|plan|holiday|in|to|for|with\s+friends|with\s+family|solo|couple|around|under|budget)\b/gi, ' ');
  clean = clean.replace(/[^a-zA-Z\s]/g, ' ');
  clean = clean.replace(/\s+/g, ' ').trim();

  let destination = '';
  if (clean.length >= 2) {
    destination = clean
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  if (!destination) {
    destination = 'Bali, Indonesia';
  }

  return {
    destination,
    days: Math.max(1, Math.min(14, days)),
    budget: Math.max(5000, budget),
    cleanedPrompt: prompt,
  };
}
