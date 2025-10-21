import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generate an engaging video description using Gemini AI
 * @param {Object} listing - Listing data
 * @param {string} listing.title - Listing title
 * @param {string} listing.description - Original description (HTML or text)
 * @param {Object} listing.specifications - Specifications object
 * @returns {Promise<string>} Enhanced description for video
 */
export async function generateVideoDescription(listing) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback description');
      return generateFallbackDescription(listing);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Extract plain text from HTML description if needed
    const plainDescription = listing.description
      ? listing.description.replace(/<[^>]*>/g, '').trim()
      : '';

    // Build context for AI
    const context = `
Product Title: ${listing.title}
Category: ${listing.specifications?.category || 'Precious Metal'}
Condition: ${listing.specifications?.condition || 'N/A'}
Weight: ${listing.specifications?.weight || 'N/A'}
Purity: ${listing.specifications?.purity || 'N/A'}
Year: ${listing.specifications?.year || 'N/A'}
Original Description: ${plainDescription || 'No description provided'}
`.trim();

    const prompt = `You are writing a captivating description for a 10-second video reel showcasing a precious metal product.

${context}

Create a short, engaging description (1-2 sentences, max 120 characters) that:
- Highlights the most exciting or valuable aspects of this item
- Uses descriptive, evocative language
- Appeals to collectors, investors, or precious metal enthusiasts
- Sounds professional but exciting
- NO emojis, hashtags, or promotional language like "Shop Now"
- Focus on the item's quality, rarity, history, or investment value

Generate ONLY the description text, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();

    // Validate length
    if (description.length > 150) {
      return description.substring(0, 147) + '...';
    }

    console.log('✅ AI-generated video description:', description);
    return description;

  } catch (error) {
    console.error('❌ Error generating AI description:', error.message);
    return generateFallbackDescription(listing);
  }
}

/**
 * Generate a fallback description without AI
 */
function generateFallbackDescription(listing) {
  const { title, specifications } = listing;

  // Extract key details
  const category = specifications?.category || 'precious metal';
  const condition = specifications?.condition || '';
  const purity = specifications?.purity || '';
  const year = specifications?.year || '';

  // Build description from available data
  let description = '';

  if (purity && year) {
    description = `${purity} purity ${category.toLowerCase()} from ${year}. ${condition ? condition + ' condition.' : 'Exceptional quality.'}`;
  } else if (purity) {
    description = `Premium ${purity} purity ${category.toLowerCase()}. ${condition ? condition + ' condition.' : 'Investment grade.'}`;
  } else if (year) {
    description = `Collectible ${category.toLowerCase()} from ${year}. ${condition ? condition + ' condition.' : 'Excellent specimen.'}`;
  } else {
    description = `Beautiful ${category.toLowerCase()} piece. ${condition ? condition + ' condition.' : 'Quality guaranteed.'}`;
  }

  // Ensure it's not too long
  if (description.length > 120) {
    description = description.substring(0, 117) + '...';
  }

  return description;
}

/**
 * Generate a longer, detailed description for the CTA scene
 * @param {Object} listing - Listing data
 * @returns {Promise<string>} Detailed description
 */
export async function generateDetailedDescription(listing) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return generateFallbackDetailed(listing);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const plainDescription = listing.description
      ? listing.description.replace(/<[^>]*>/g, '').trim()
      : '';

    const context = `
Product: ${listing.title}
Category: ${listing.specifications?.category || 'Precious Metal'}
Details: ${plainDescription || 'Quality precious metal item'}
`.trim();

    const prompt = `Write a compelling single sentence (max 80 characters) for a video showcasing this precious metal product:

${context}

The sentence should:
- Be short and punchy
- Highlight value or appeal
- Sound premium/luxury
- NO emojis or hashtags
- Make viewers want to learn more

Generate ONLY the sentence, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let description = response.text().trim();

    // Clean up quotes if AI added them
    description = description.replace(/^["']|["']$/g, '');

    if (description.length > 80) {
      description = description.substring(0, 77) + '...';
    }

    return description;

  } catch (error) {
    console.error('Error generating detailed description:', error.message);
    return generateFallbackDetailed(listing);
  }
}

function generateFallbackDetailed(listing) {
  const category = listing.specifications?.category || 'precious metal';
  return `Discover this exceptional ${category.toLowerCase()} piece.`;
}
