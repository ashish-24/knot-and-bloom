import { prisma } from './db';

export interface AIShoppingQueryResponse {
  success: boolean;
  intent?: string;
  suggestedFilter?: {
    maxPrice?: number;
    searchQuery?: string;
    categorySlug?: string;
  };
  recommendations: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail: string;
    shortDescription: string;
  }>;
  aiCommentary: string;
}

export async function processAIShoppingAssistant(userPrompt: string): Promise<AIShoppingQueryResponse> {
  const isEnabled = process.env.AI_ENABLED === 'true';
  const apiKey = process.env.XAI_API_KEY;

  // Fallback database search if AI is disabled or unconfigured
  if (!isEnabled || !apiKey) {
    return runDatabaseFallbackAssistant(userPrompt);
  }

  try {
    // Record AI request metric
    await prisma.aIUsage.create({
      data: { endpoint: 'assistant', tokens: 150 },
    }).catch(() => {});

    // Call xAI / Grok OpenAI-compatible endpoint
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are the helpful AI concierge for Knot & Bloom, a handmade gift store. Extract the customer budget limit (in INR) and key search keywords from their query.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return runDatabaseFallbackAssistant(userPrompt);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return runDatabaseFallbackAssistant(userPrompt, content);
  } catch (error) {
    console.error('AI assistant error (falling back to database search):', error);
    return runDatabaseFallbackAssistant(userPrompt);
  }
}

export async function runDatabaseFallbackAssistant(
  userPrompt: string,
  aiCommentaryOverride?: string
): Promise<AIShoppingQueryResponse> {
  // Extract numbers (price budget)
  const priceMatch = userPrompt.match(/under\s*₹?\s*(\d+)/i) || userPrompt.match(/₹?\s*(\d+)/);
  const maxPrice = priceMatch ? parseFloat(priceMatch[1]) : undefined;

  // Clean keywords
  const keywords = userPrompt
    .toLowerCase()
    .replace(/under|gift|something|for|my|price|rupees|rs|inr|looking|want|show|me/gi, '')
    .trim();

  // Query actual database
  const products = await prisma.product.findMany({
    where: {
      published: true,
      deletedAt: null,
      AND: [
        maxPrice ? { price: { lte: maxPrice } } : {},
        keywords
          ? {
              OR: [
                { name: { contains: keywords } },
                { description: { contains: keywords } },
                { tags: { contains: keywords } },
              ],
            }
          : {},
      ],
    },
    take: 4,
  });

  const aiCommentary =
    aiCommentaryOverride ||
    (products.length > 0
      ? `Here are our top handcrafted picks matching "${userPrompt}" from the Knot & Bloom workshop!`
      : `We couldn't find an exact match for "${userPrompt}", but explore our most loved artisanal gifts below:`);

  return {
    success: true,
    suggestedFilter: { maxPrice, searchQuery: keywords },
    recommendations: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      thumbnail: p.thumbnail,
      shortDescription: p.shortDescription,
    })),
    aiCommentary,
  };
}

export async function generateAIProductCopy(productName: string, category: string): Promise<string> {
  const isEnabled = process.env.AI_ENABLED === 'true';
  const apiKey = process.env.XAI_API_KEY;

  if (!isEnabled || !apiKey) {
    return `Handcrafted with love and meticulous care, this ${productName} brings timeless organic elegance to your collection. Made from premium eco-conscious materials.`;
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Write an enticing 2-sentence handmade e-commerce product description for Knot & Bloom.',
          },
          {
            role: 'user',
            content: `Product Name: ${productName}, Category: ${category}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error('AI generation failed');

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Handmade ${productName} designed to perfection.`;
  } catch (err) {
    return `Handcrafted with love and meticulous care, this ${productName} brings timeless organic elegance to your collection.`;
  }
}
