import { Brand, ReferenceFolder } from '../types';

// --- SIMULATED AI FUNCTIONS ---

/**
 * Simulates finding the best reference folder by matching keywords.
 * In a real app, this would be a call to a vector database or a semantic search model.
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

  // If no keywords matched, just return the first folder as a fallback
  return bestMatch || folders[0];
};

/**
 * Simulates constructing a detailed prompt for an image generation model like Nano Banana.
 */
export const constructNanoBananaPrompt = (
  inputs: { concept: string; message: string; goal: string; ratio: string },
  brand: Brand,
  reference: ReferenceFolder
): string => {
  const referenceStyle = [...(reference.manual_keywords || []), ...(reference.auto_keywords || [])].join(', ');
  
  return `
    Generate a photorealistic, high-quality ad visual with the following characteristics:
    - Core Concept: "${inputs.concept}"
    - Key Message to Convey: "${inputs.message}"
    - Campaign Goal: ${inputs.goal} (e.g., for 'Sales', make it eye-catching; for 'Premium Branding', make it elegant)
    - Aspect Ratio: ${inputs.ratio}
    - Brand Personality: ${brand.personality_keywords.join(', ')}
    - Visual Style Inspiration (from reference folder '${reference.name}'): ${referenceStyle}, cinematic lighting, clean, polished aesthetic.
    - IMPORTANT: Do not include any text, words, or letters in the image. The logo will be added later if needed.
  `.trim().replace(/\s+/g, ' ');
};

/**
 * Simulates generating an image. Returns a placeholder URL based on the aspect ratio.
 */
export const generateVisual = async (ratio: string): Promise<string> => {
    const ratioMap: { [key: string]: string } = {
        "1:1 Square": "1080x1080",
        "4:5 Portrait": "1080x1350",
        "9:16 Story": "1080x1920",
        "16:9 Landscape": "1920x1080",
    };
    const dimensions = ratioMap[ratio] || "1080x1080";
    const randomId = Math.floor(Math.random() * 1000); // To get different images

    // Simulate network delay for AI generation
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    return `https://picsum.photos/seed/${randomId}/${dimensions.replace('x', '/')}`;
};


/**
 * Simulates generating a social media caption based on the ad goal and brand.
 */
export const generateCaption = async (goal: string, brandName: string, concept: string): Promise<string> => {
  const brandHashtag = `#${brandName.replace(/\s+/g, '')}`;
  let caption = '';

  switch (goal) {
    case 'Sales':
      caption = `Ready for an upgrade? ✨ Discover ${concept.toLowerCase()} with ${brandName}. Shop the collection now and experience the difference. 
      
      ➡️ Click the link in our bio to order!
      
      #Sales #LimitedTimeOffer ${brandHashtag}`;
      break;
    case 'Engagement':
      caption = `What does "${concept.toLowerCase()}" mean to you? 🤔 We think it's all about quality and passion. Let us know your thoughts in the comments below! 👇
      
      #Community #Discussion ${brandHashtag}`;
      break;
    case 'Premium Branding':
      caption = `Elegance is an attitude. ${brandName}.
      
      #Luxury #Premium #Craftsmanship ${brandHashtag}`;
      break;
    case 'Awareness':
    default:
      caption = `Introducing the heart of ${brandName}: ${concept.toLowerCase()}. Built with passion, designed for you. ❤️
      
      #BrandAwareness #New #Discover ${brandHashtag}`;
      break;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  return caption;
};
