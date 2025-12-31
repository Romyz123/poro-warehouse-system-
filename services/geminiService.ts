
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AuditLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeStockLevels = async (inventory: InventoryItem[], logs: AuditLog[]) => {
  const inventoryContext = inventory.map(i => ({
    sku: i.sku,
    name: i.name,
    qty: i.quantity,
    min: i.minStock,
    category: i.category
  }));

  const prompt = `
    As a warehouse optimization AI, analyze the current inventory and suggest items that need attention.
    Current Inventory: ${JSON.stringify(inventoryContext)}
    
    Identify:
    1. Critical low stock items.
    2. Potential overstock (items far exceeding minStock).
    3. Suggestions for minStock adjustments based on typical warehouse velocity.
    
    Provide your response in a clear, professional summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze inventory. Please try again later.";
  }
};

export const editInventoryImage = async (prompt: string, currentImageBase64?: string) => {
  try {
    const contents: any[] = [{ text: prompt }];
    
    if (currentImageBase64) {
      // Clean base64 string if it contains the data prefix
      const base64Data = currentImageBase64.split(',')[1] || currentImageBase64;
      contents.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contents },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

export const suggestBinOptimization = async (inventory: InventoryItem[]) => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        sku: { type: Type.STRING },
        suggestedAisle: { type: Type.STRING },
        reason: { type: Type.STRING }
      },
      required: ["sku", "suggestedAisle", "reason"]
    }
  };

  const prompt = `
    Given this warehouse inventory: ${JSON.stringify(inventory.map(i => ({ sku: i.sku, category: i.category, aisle: i.location.aisle })))}
    Suggest moving items between aisles (A, B, C, D) to group similar categories together for better picking efficiency.
    Return a list of suggested moves.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    return [];
  }
};
