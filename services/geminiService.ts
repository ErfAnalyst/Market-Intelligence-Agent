import { GoogleGenAI, Type, FunctionDeclaration, Tool, Schema } from "@google/genai";
import { MarketData, CompetitorDetail } from "../types";

// System Instruction for the Persona
const SYSTEM_INSTRUCTION = `
I. ROLE & PERSONA
You are the Lead Market Research Scientist for the consolidated entity AD&I (Affordable Dentures & Implants) and DDS (DDS Dentures + Implant Solutions). Your mission is to deliver "Data-Hardened" competitive intelligence across various DMAs, primarily focused on the DFW (Dallas-Fort Worth) market. You speak with scientific rigor, precision, and a focus on "Apples-to-Apples" financial comparison.

II. OPERATIONAL CHAIN OF COMMAND (Data Hierarchy)
Level 1 (Absolute Truth): User-Provided "HLRL Locks".
Level 2 (Internal Knowledge): Internal PDFs/Knowledge Base.
Level 3 (Market Discovery): Real-time Search/Maps.

III. PRICING & TIERING STANDARDS
Tier 0: Economy (Denture-only).
Tier 1: EconomyPlus Dentures (Low-Range/High-Range).
Tier 2: Premium.
Tier 3: UltimateFit.

IV. OUTPUT PROTOCOLS
Produce strict structured data for Competitive Matrices and Appendices.
Guardrail: If a price is significantly lower than AD&I's floor, mark as "TBD".
`;

// Level 1: HLRL Locks for DFW
const DFW_HLRL_LOCKS: MarketData[] = [
  { dsoName: "Ideal Dental (DECA)", clinicCount: 65, dentistCount: 136, surgeonCount: 12, priceDenture: 650, priceTier1Low: 1000, priceTier1High: 1500 },
  { dsoName: "Smile Brands", clinicCount: 51, dentistCount: 50, surgeonCount: 8, priceDenture: 650, priceTier1Low: 950, priceTier1High: 1350 },
  { dsoName: "Jefferson Dental", clinicCount: 35, dentistCount: 40, surgeonCount: 6, priceDenture: 550, priceTier1Low: 699, priceTier1High: 1100 },
  { dsoName: "Pacific Dental (PDS)", clinicCount: 35, dentistCount: 38, surgeonCount: 10, priceDenture: 700, priceTier1Low: 1100, priceTier1High: 1600 },
  { dsoName: "Heartland Dental", clinicCount: 30, dentistCount: 45, surgeonCount: 8, priceDenture: 1100, priceTier1Low: 1100, priceTier1High: 1600 },
  { dsoName: "AD&I/DDS", clinicCount: 22, dentistCount: 45, surgeonCount: 6, priceDenture: 599, priceTier1Low: 800, priceTier1High: 1200 },
  { dsoName: "Aspen Dental", clinicCount: 20, dentistCount: 19, surgeonCount: 4, priceDenture: 499, priceTier1Low: 1100, priceTier1High: 1400 },
  { dsoName: "Great Expressions", clinicCount: 8, dentistCount: 8, surgeonCount: 2, priceDenture: 850, priceTier1Low: 850, priceTier1High: 1250 },
  { dsoName: "Sage Dental", clinicCount: 6, dentistCount: 6, surgeonCount: 1, priceDenture: 800, priceTier1Low: 900, priceTier1High: 1350 },
  { dsoName: "Archpoint ID", clinicCount: 3, dentistCount: 5, surgeonCount: 2, priceDenture: 'TBD', priceTier1Low: 1500, priceTier1High: 3000 },
  { dsoName: "ClearChoice", clinicCount: 3, dentistCount: 3, surgeonCount: 3, priceDenture: 'TBD', priceTier1Low: 'TBD', priceTier1High: 'TBD' },
  { dsoName: "Texas Implant & Dental", clinicCount: 2, dentistCount: 4, surgeonCount: 1, priceDenture: 895, priceTier1Low: 895, priceTier1High: 1700 },
  { dsoName: "Fast New Smile", clinicCount: 2, dentistCount: 3, surgeonCount: 3, priceDenture: 'TBD', priceTier1Low: 'TBD', priceTier1High: 'TBD' },
  { dsoName: "Nuvia", clinicCount: 2, dentistCount: 4, surgeonCount: 4, priceDenture: 'TBD', priceTier1Low: 2500, priceTier1High: 3000 },
  { dsoName: "New Choice Dentures", clinicCount: 1, dentistCount: 3, surgeonCount: 1, priceDenture: 550, priceTier1Low: 795, priceTier1High: 1500 },
];

class GeminiService {
  private ai: GoogleGenAI;
  private model: string = 'gemini-3-pro-preview';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Helper to clean JSON from Markdown
  private cleanJson(text: string): string {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) return match[1];
    const match2 = text.match(/```\s*([\s\S]*?)\s*```/);
    if (match2) return match2[1];
    return text;
  }

  // Generate the Market Matrix (Page 1 Data)
  async generateMarketMatrix(dma: string): Promise<MarketData[]> {
    // Level 1: HLRL Locks
    // If the DMA matches DFW, return the user-provided lock data directly.
    if (dma === 'Dallas-Fort Worth') {
      // We simulate a small delay to make it feel consistent with UI loading states, 
      // or just return immediately.
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(DFW_HLRL_LOCKS);
        }, 800); 
      });
    }

    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Analyze the ${dma} DMA. Identify competitive DSOs. 
    Return a STRICT JSON ARRAY. Do not include any text outside the JSON block.
    
    For each DSO object in the array, include these keys:
    - "dsoName" (string)
    - "clinicCount" (number)
    - "dentistCount" (number)
    - "surgeonCount" (number)
    - "priceDenture" (number or "TBD")
    - "priceTier1Low" (number or "TBD")
    - "priceTier1High" (number or "TBD")
    
    If data is missing, make a reasonable estimate based on search data or mark as 0/"TBD" if totally unknown.
    `;

    try {
      // NOTE: Using responseSchema with googleSearch can sometimes conflict in Preview models. 
      // Using pure prompt engineering with tools for maximum compatibility.
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          // googleMaps is only supported in gemini-2.5-flash, not 3-pro-preview.
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      if (!text) return [];
      
      const cleanedJson = this.cleanJson(text);
      const rawData = JSON.parse(cleanedJson);
      
      return rawData.map((item: any) => ({
        ...item,
        priceDenture: item.priceDenture === -1 ? 'TBD' : item.priceDenture,
        priceTier1Low: item.priceTier1Low === -1 ? 'TBD' : item.priceTier1Low,
        priceTier1High: item.priceTier1High === -1 ? 'TBD' : item.priceTier1High,
      }));

    } catch (error) {
      console.error("Error generating market matrix:", error);
      // Return dummy data on failure to prevent UI crash, but log error
      return [];
    }
  }

  // Generate Competitor Details (Page 2 Data)
  async generateCompetitorDetails(dma: string, dsoName: string): Promise<CompetitorDetail> {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `For the DSO "${dsoName}" in ${dma}, provide a detailed list of key personnel and evidence sources.
    Return a STRICT JSON OBJECT with keys: "dsoName", "dentistNames" (array of strings), "surgeonNames" (array of strings), "evidenceSource" (string).`;
    
    try {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }],
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No text returned");
        
        const cleanedJson = this.cleanJson(text);
        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error("Error getting details:", error);
        return { dsoName, dentistNames: [], surgeonNames: [], evidenceSource: "Error fetching data" };
    }
  }

  // General Chat
  async chatWithAgent(message: string, history: any[]) {
      // Re-initialize to ensure fresh key if changed (though process.env is usually static)
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
      
      const chat = this.ai.chats.create({
          model: 'gemini-3-pro-preview',
          config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              // googleMaps is only supported in gemini-2.5-flash, not 3-pro-preview.
              tools: [{ googleSearch: {} }] 
          },
          history: history
      });
      
      return chat.sendMessageStream({ message });
  }

  // Image Generation (Nano Banana Pro)
  async generateImage(prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '1:1') {
      const model = size === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      
      // Re-init for key freshness
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      try {
        const response = await this.ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: aspectRatio
                }
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 return `data:image/png;base64,${part.inlineData.data}`;
             }
        }
        return null;
      } catch (e) {
          console.error(e);
          return null;
      }
  }

  // Veo Video Generation
  async generateVideo(prompt: string) {
       // Re-init for key freshness
       this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

       try {
        let operation = await this.ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        
        while(!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await this.ai.operations.getVideosOperation({operation});
        }
        
        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) return `${uri}&key=${process.env.API_KEY}`;
        return null;

       } catch (e) {
           console.error(e);
           return null;
       }
  }
}

export const geminiService = new GeminiService();