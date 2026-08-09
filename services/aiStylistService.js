const Product = require('../models/Product');
const { createError } = require('../utils/response');

/**
 * Service to fetch styling recommendation from an LLM grounded in current in-stock catalog
 */
exports.getStylingRecommendation = async ({ prompt, budget, category, sessionId, previousLogs = [] }) => {
  // 1. Fetch in-stock active products from MongoDB context
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }
  if (budget && !isNaN(Number(budget))) {
    filter.basePrice = { $lte: Number(budget) };
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .limit(30);

  // Ensure total stock across sizes > 0
  const inStockProducts = products.filter((p) =>
    p.sizes && p.sizes.some((s) => s.stock > 0)
  );

  if (inStockProducts.length === 0) {
    return {
      rationale: 'No matching in-stock products available for your criteria at this moment.',
      recommendedProducts: [],
    };
  }

  // Map of valid product IDs to strictly guarantee grounding (no hallucinations)
  const validProductMap = new Map();
  inStockProducts.forEach((p) => {
    validProductMap.set(p._id.toString(), p);
  });

  // Prepare minimal catalog summary for LLM prompt context
  const catalogContext = inStockProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category ? p.category.name : 'Clothing',
    price: p.basePrice,
    description: p.description || '',
  }));

  const apiKey = process.env.AI_STYLIST_API_KEY;
  const apiUrl = process.env.AI_STYLIST_API_URL || 'https://api.openai.com/v1/chat/completions';
  const modelName = process.env.AI_STYLIST_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw createError(
      503,
      'AI Stylist provider is not configured. Missing AI_STYLIST_API_KEY environment variable.'
    );
  }

  // Build light personalization summary from prior logs
  let personalizationContext = '';
  if (Array.isArray(previousLogs) && previousLogs.length > 0) {
    const pastQueries = previousLogs
      .map((log) => `"- ${log.query}"`)
      .join('\n');
    personalizationContext = `\nUser's Recent Interaction History & Preferences:\n${pastQueries}\nConsider these past preferences for subtle personalization when selecting items.\n`;
  }

  const systemMessage = `You are a professional AI fashion stylist. Analyze the user's styling request and recommend an outfit using ONLY the provided catalog of available in-stock products.${personalizationContext}

Catalog:
${JSON.stringify(catalogContext, null, 2)}

Requirements:
1. You MUST ONLY recommend product IDs that exist in the provided catalog. Never invent product IDs.
2. Return your response in STRICT JSON format with exactly two fields:
   - "rationale": A short, friendly explanation of why these products match the styling request.
   - "recommendedProductIds": An array of product ID strings chosen from the catalog.`;


  const userMessage = `User Request: "${prompt || 'Suggest a stylish outfit'}"` +
    (budget ? `\nBudget limit: $${budget}` : '');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createError(
        502,
        `AI Stylist provider error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw createError(502, 'Empty response received from AI Stylist provider.');
    }

    // Strip potential markdown code block markers
    const cleanedJsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleanedJsonStr);
    } catch (_parseErr) {
      throw createError(502, 'Invalid JSON format returned by AI Stylist provider.');
    }

    const rationale = parsed.rationale || 'Here are your recommended styling items based on your request.';
    const candidateIds = Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [];

    // Filter to strictly ensure only real product IDs from the DB catalog are returned
    const recommendedProducts = candidateIds
      .map((id) => validProductMap.get(id.toString()))
      .filter((p) => p !== undefined);

    return {
      rationale,
      recommendedProducts,
    };
  } catch (err) {
    if (err.statusCode || err.status) {
      throw err;
    }
    throw createError(502, `AI Stylist service failure: ${err.message}`);
  }
};
