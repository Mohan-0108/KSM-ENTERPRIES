import { GoogleGenAI } from "@google/genai";
import { AppData, TransactionType } from "../types";

const SYSTEM_INSTRUCTION = `
You are a senior business analyst for a retail inventory management system. 
Analyze the provided JSON data containing product lists and transaction history. 
Provide a concise executive summary consisting of:
1. Best performing products (by quantity sold).
2. Stock alerts (items with low or high inventory compared to sales).
3. A strategic pricing recommendation based on margins.
4. A general business health sentiment (Positive, Neutral, Negative) with a short reason.
Keep the output valid markdown, bulleted, and professional.
`;

export const analyzeBusinessData = async (data: AppData): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare a simplified dataset to save tokens and focus on relevance
    const analysisContext = {
      products: data.products.map(p => ({
        name: p.name,
        stock: p.currentStock,
        buy: p.defaultBuyPrice,
        sell: p.defaultSellPrice
      })),
      recentSales: data.transactions
        .filter(t => t.type === TransactionType.OUTWARD)
        .slice(0, 50) // Analyze last 50 sales for brevity
        .map(t => ({
          date: new Date(t.date).toISOString().split('T')[0],
          items: t.items.map(i => `${i.productName} (x${i.quantity})`)
        }))
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here is the current business data: ${JSON.stringify(analysisContext)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature for more analytical/consistent results
      }
    });

    return response.text || "No analysis could be generated at this time.";

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating analysis. Please check your API key and try again.";
  }
};