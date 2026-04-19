import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeImage(base64Data: string, mimeType: string, language: string = "English") {
  const prompt = `
    You are a high-level digital forensic and OSINT (Open Source Intelligence) investigator for the "GEOLENS" system.
    Analyze this image in ${language}.
    
    CRITICAL OBJECTIVE: Determine the EXACT location.
    
    1. BRAND & LOGO SEARCH:
       - If a specific brand, quest room, or establishment name is visible (e.g., "DoM STRAHA"), you MUST cross-reference all known branches of this business across different cities (e.g., Stavropol, Yalta, etc.).
       - Compare the SPECIFIC interior details (wall textures, floor tiles, background graphics) with known images of those branches to differentiate between them.
    
    2. LOCATIONAL ANALYSIS (MANDATORY):
       - Precise triangulation: City, Street, or Coordinates.
       - Evidence list: Signage, architectural styles, license plate formats.
       - Historical Context: Consider if this location has moved or changed its appearance over time.
    
    3. PROFILING & CONTEXT:
       - What do the subjects' clothing and the environment suggest about the region's climate or current events?
    
    4. REPORT FORMAT:
       - Use a professional "Hacker System" report style.
       - Language: ${language}.
       - Format: Markdown with sharp headers.
       - If you found multiple matches using the brand name, explain why you chose the final one based on visual evidence.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Не удалось проанализировать изображение. Попробуйте еще раз.");
  }
}
