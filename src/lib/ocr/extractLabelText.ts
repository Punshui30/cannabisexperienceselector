import { createWorker } from 'tesseract.js';

/**
 * OCR Helper
 * Extracts text from a cannabis label image using tesseract.js.
 * Runs client-side.
 */
export async function extractLabelTextFromImage(imageSource: Blob | string): Promise<string> {
    const worker = await createWorker('eng');

    try {
        console.log('[OCR] Starting extraction with timeout...');

        // Timeout guard (e.g., 10 seconds)
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('OCR Timeout after 10s')), 10000);
        });

        const ocrPromise = (async () => {
            const { data: { text } } = await worker.recognize(imageSource);
            return text;
        })();

        const extractedText = await Promise.race([ocrPromise, timeoutPromise]);

        // Clean up the text: strip non-alphanumeric (mostly), collapse whitespace
        const cleanText = extractedText
            .replace(/[^\w\s%.-]/gi, ' ') // keep % and . for potency/terpenes
            .replace(/\s+/g, ' ')
            .trim();

        console.log('[OCR] Extraction complete. Length:', cleanText.length);
        return cleanText;
    } catch (err) {
        console.warn('[OCR_FAILED]', err);
        return "";
    } finally {
        await worker.terminate();
    }
}
