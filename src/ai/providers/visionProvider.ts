import { z } from 'zod';
import { AI_CONFIG, assertFeatureAccess } from '../config';
import { LibraryMemoryStore, getSHA256 } from '../../lib/memory/libraryMemory';

/**
 * VISION SCHEMAS
 * Structured types for cannabis label/COA extraction.
 */

export const LabelScanSchema = z.object({
    isCannabisLabel: z.boolean().describe("Whether this image appears to be a cannabis product label or COA."),
    brand: z.string().optional(),
    strainName: z.string().optional(),
    productName: z.string().optional(),
    thcPct: z.number().optional(),
    cbdPct: z.number().optional(),
    terpenes: z.array(z.object({
        name: z.string(),
        percent: z.number()
    })).optional(),
    analysis: z.string().describe("A brief medical-grade clinical assessment of the profile. If NOT a cannabis product, describe what it is and why it doesn't match.")
});

export type LabelScan = z.infer<typeof LabelScanSchema>;

/**
 * VISION PROVIDER
 */
export const OpenAIVisionProvider = {
    async scanLabel(imageBlob: Blob): Promise<LabelScan> {
        // 1. Guard check
        assertFeatureAccess('vision', 'Label Scan');

        // 2. Hash & Check Cache
        const hash = await getSHA256(imageBlob);
        const cached = LibraryMemoryStore.getCachedVision(hash);
        if (cached) {
            console.log(`[VISION] Cache HIT for image hash: ${hash}`);
            return cached as LabelScan;
        }

        // 3. Process with OpenAI Vision
        console.log(`[VISION] Processing new image scan...`);
        const result = await this.callOpenAIVision(imageBlob);

        // 4. Cache and Return
        LibraryMemoryStore.cacheVision(hash, result);
        return result;
    },

    async callOpenAIVision(blob: Blob): Promise<LabelScan> {
        // Convert blob to base64
        const base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        const response = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: AI_CONFIG.models.vision,
                messages: [
                    {
                        role: 'system',
                        content: `You are a high-precision cannabis label analyzer. 
                        Your job is to identify if an image is a cannabis product (flower, concentrate, edible, etc.) and extract potency/terpene data.
                        
                        CRITICAL IDENTIFICATION RULE:
                        - If the image is NOT a cannabis product (e.g., standard food, electronics, random objects), set "isCannabisLabel": false.
                        - If it IS cannabis, set "isCannabisLabel": true.
                        
                        DATA EXTRACTION:
                        - Extract "brand", "strainName", "productName", "thcPct", "cbdPct".
                        - Extract "terpenes" as an array of objects with "name" and "percent".
                        - In "analysis", provide a professional summary. If it's NOT a cannabis product, explain clearly what it is.
                        
                        Output must be valid JSON matching the schema.`
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Determine if this is a cannabis product and extract details:' },
                            { type: 'image_url', image_url: { url: base64Image } }
                        ]
                    }
                ],
                temperature: 0,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`Vision API failed: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        // Extract JSON block
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse JSON from Vision response");

        const parsed = JSON.parse(jsonMatch[0]);
        return LabelScanSchema.parse(parsed);
    }
};
