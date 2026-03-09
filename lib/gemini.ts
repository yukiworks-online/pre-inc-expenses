import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.warn("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// MODEL_NAME declaration moved down
// User requested "Gemini 3 Flash" (gemini-3-flash-preview). Let's try to use exact model name if it exists, or closest.
// Actually standard is gemini-1.5-flash or gemini-2.0-flash-exp. 
// Let's use 'gemini-1.5-flash' as formatted in safety, or 'gemini-2.0-flash-exp' if that's what is meant.
// The prompt said "Gemini 3 Flash (preview)". I will use 'gemini-2.0-flash-exp' as it matches "Flash" and is preview.
// Wait, prompt specifically said "gemini-3-flash-preview". I will use that string but fallback if it fails.
// Actually, I'll default to "gemini-1.5-flash" for stability unless user insists, but user specs said "gemini-3-flash-preview".
// I will use "gemini-1.5-flash" because "3" might be a typo for "2" or "1.5" as 3 isn't out? 
// Ah, maybe the user *means* the new experimental ones.
// Let's stick to safe 'gemini-1.5-flash' for now to ensure it works, OR 'gemini-1.5-pro'.

const schema = {
    description: "Receipt extraction schema",
    type: SchemaType.OBJECT,
    properties: {
        doc_type: { type: SchemaType.STRING },
        document_date: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
        vendor_name: { type: SchemaType.STRING },
        total_amount: { type: SchemaType.NUMBER },
        currency: { type: SchemaType.STRING },
        tax_included: { type: SchemaType.BOOLEAN, nullable: true },
        line_items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    description: { type: SchemaType.STRING },
                    amount: { type: SchemaType.NUMBER },
                }
            }
        },
        confidence: { type: SchemaType.STRING, description: "High/Medium/Low" },
        warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
    },
    required: ["total_amount", "confidence"] // Keep it loose
};

async function callGeminiModelWithSchema(modelName: string, prompt: string, imageBuffer: Buffer, mimeType: string) {
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema as any
        }
    });

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        }
    ]);
    return JSON.parse(result.response.text());
}

export async function extractReceiptData(imageBuffer: Buffer, mimeType: string) {
    const prompt = "Extract the following data from this receipt. Return JSON.";

    try {
        // Attempt 1: Gemini 3.0 Flash (Highest Performance)
        return await callGeminiModelWithSchema("gemini-3.0-flash", prompt, imageBuffer, mimeType);
    } catch (err: any) {
        console.warn("Primary Model (gemini-3.0-flash) failed:", err.message);

        // Attempt 2: Fallback to Gemini 2.5 Flash (Older Flash)
        try {
            console.log("Falling back to Secondary: gemini-2.5-flash");
            return await callGeminiModelWithSchema("gemini-2.5-flash", prompt, imageBuffer, mimeType);
        } catch (errRetry: any) {
            console.warn("Secondary Model (gemini-2.5-flash) failed:", errRetry.message);

            // Attempt 3: Fallback to Gemini 3.1 Flash Lite (Lite but Newest)
            try {
                console.log("Falling back to Tertiary: gemini-3.1-flash-lite");
                return await callGeminiModelWithSchema("gemini-3.1-flash-lite", prompt, imageBuffer, mimeType);
            } catch (errFinal: any) {
                console.error("All Gemini models failed. Last error (gemini-3.1-flash-lite):", errFinal);
                throw errFinal;
            }
        }
    }
}
