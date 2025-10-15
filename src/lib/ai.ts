import { Brand, ReferenceFolder } from '../types';

// --- API CLIENT INITIALIZATION ---

const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const nanoBananaApiKey = import.meta.env.VITE_NANOBANANA_API_KEY;
const NANO_BANANA_API_ENDPOINT = "https://api.nanobanana.dev/v1/generate"; // Fictional endpoint

/**
 * Simulates finding the best reference folder by matching keywords.
 */
export const findBestReferenceFolder = (concept: string, folders: ReferenceFolder[]): ReferenceFolder | null => {
  if (folders.length === 0) return null;

  const conceptKeywords = concept.toLowerCase().split(/\s+/);
  let bestMatch: ReferenceFolder | null = null;
  let maxScore = -1;

  folders.forEach(folder => {
    const folderKeywords = [
      folder.name.toLowerCase(),
      ...(folder.manual_keywords || []).map(k => k.toLowerCase()),
      ...(folder.auto_keywords || []).map(k => k.toLowerCase()),
    ].join(' ');

    let score = 0;
    conceptKeywords.forEach(ck => {
      if (folderKeywords.includes(ck)) {
        score++;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = folder;
    }
  });

  return bestMatch || folders[0];
};

/**
 * Constructs a structured payload for an image generation model like Nano Banana.
 */
export const constructNanoBananaPrompt = (
  inputs: { concept: string; message: string; goal: string; ratio: string },
  brand: Brand,
  reference: ReferenceFolder
): object => {
  const referenceStyle = [...(reference.manual_keywords || []), ...(reference.auto_keywords || [])].join(', ');
  
  return {
    model: "nano-banana-photorealistic-v2",
    prompt: `A photorealistic, high-quality ad visual. Core Concept: "${inputs.concept}". Message: "${inputs.message}".`,
    style_preset: "cinematic-default",
    parameters: {
      campaign_goal: inputs.goal,
      aspect_ratio: inputs.ratio,
      brand_personality: (brand.personality_keywords || []).join(', '),
      visual_style_inspiration: `From reference folder '${reference.name}': ${referenceStyle}, cinematic lighting, clean, polished aesthetic.`,
      negative_prompt: "text, words, letters, logos, watermarks",
    }
  };
};

/**
 * Generates a visual by calling the (fictional) Nano Banana API.
 * Falls back to a placeholder image service if the API call fails.
 */
export const generateVisual = async (promptPayload: object, ratio: string): Promise<string> => {
    console.log("Attempting to generate visual with Nano Banana with payload:", promptPayload);

    try {
        if (!nanoBananaApiKey || nanoBananaApiKey === "YOUR_API_KEY") {
            throw new Error("Nano Banana API key not configured. Falling back to placeholder.");
        }

        const response = await fetch(NANO_BANANA_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nanoBananaApiKey}`
            },
            body: JSON.stringify(promptPayload)
        });

        if (!response.ok) throw new Error(`Nano Banana API responded with status: ${response.status}`);
        const result = await response.json();
        if (!result.imageUrl) throw new Error("Invalid response from Nano Banana API.");
        
        console.log("Successfully generated image from Nano Banana.");
        return result.imageUrl;

    } catch (error: any) {
        console.warn(`Nano Banana API call failed: ${error.message}. Using placeholder image service.`);
        
        const ratioMap: { [key: string]: string } = {
            "1:1 Square": "1080x1080",
            "4:5 Portrait": "1080x1350",
            "9:16 Story": "1080x1920",
            "16:9 Landscape": "1920x1080",
        };
        const dimensions = ratioMap[ratio] || "1080x1080";
        const randomId = Math.floor(Math.random() * 1000);

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return `https://picsum.photos/seed/${randomId}/${dimensions.replace('x', '/')}`;
    }
};


/**
 * Generates a social media caption using OpenRouter with a Google model.
 */
export const generateCaption = async (goal: string, brandName: string, concept: string): Promise<string> => {
  if (!openRouterApiKey || openRouterApiKey === "YOUR_API_KEY") {
    return "⚠️ OpenRouter API key not configured. Please add it to your .env file to generate captions.";
  }

  const systemPrompt = `You are a social media marketing expert. Write a short, engaging social media caption for the brand "${brandName}". The caption should be concise, include relevant emojis, and have 2-3 relevant hashtags. Create a brand-specific hashtag like #${brandName.replace(/\s+/g, '')}. Return only the caption text, without any preamble or explanation.`;
  
  const userPrompt = `The ad's core concept is: "${concept}". The primary goal of this ad is: "${goal}".`;

  try {
    const response = await fetch(OPENROUTER_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': 'https://agencybrain.dualite.dev', // Recommended by OpenRouter
            'X-Title': 'AgencyBrain', // Recommended by OpenRouter
        },
        body: JSON.stringify({
            model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", // Using a reliable, free model
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("OpenRouter API Error:", errorBody);
        throw new Error(`OpenRouter API responded with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const text = result.choices[0]?.message?.content;
    
    if (!text) {
        throw new Error("Invalid response structure from OpenRouter API.");
    }

    return text.trim();

  } catch (error) {
    console.error("Error generating caption with OpenRouter:", error);
    throw new Error("Failed to generate caption. Please check your OpenRouter API key and network connection.");
  }
};
