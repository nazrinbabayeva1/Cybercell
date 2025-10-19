import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { LogEntry, ClassificationResult, Classification } from '../types';

// The API key is handled by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        classifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    classification: {
                        type: Type.STRING,
                        enum: ['benign', 'malicious'],
                        description: "Classification for the log entry: 'benign' or 'malicious'."
                    },
                    reason: {
                        type: Type.STRING,
                        description: "A concise reason for the classification."
                    },
                    logIndex: {
                        type: Type.INTEGER,
                        description: "The original 0-based index of the log entry from the input batch."
                    }
                },
                required: ["classification", "reason", "logIndex"]
            }
        }
    },
    required: ["classifications"]
};

// Reduced batch size to prevent request payload from becoming too large, which can cause 500 errors.
const BATCH_SIZE = 25;
const MAX_RETRIES = 3;

/**
 * Makes an API call with a simple retry mechanism.
 * @param payload The payload for the generateContent call.
 * @returns The API response.
 */
async function generateContentWithRetry(payload: {
    model: string;
    contents: string;
    config: { responseMimeType: "application/json"; responseSchema: typeof responseSchema; };
}): Promise<GenerateContentResponse> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await ai.models.generateContent(payload);
        } catch (error) {
            lastError = error as Error;
            console.warn(`API call failed on attempt ${attempt + 1}/${MAX_RETRIES}. Retrying...`, error);
            if (attempt < MAX_RETRIES - 1) {
                // Exponential backoff: 1s, 2s
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    }
    throw lastError;
}


export async function analyzeLogs(
    logs: LogEntry[],
    onProgress: (progress: number) => void
): Promise<ClassificationResult[]> {
    const model = "gemini-2.5-flash";
    const allResults: (ClassificationResult | undefined)[] = new Array(logs.length).fill(undefined);
    let processedCount = 0;
    
    onProgress(0);

    for (let i = 0; i < logs.length; i += BATCH_SIZE) {
        const batch = logs.slice(i, i + BATCH_SIZE);
        const logDataForPrompt = batch.map((log, index) =>
            `Log Index: ${index}\nPath: ${log.path}\nBody: ${log.body}\n---`
        ).join('\n');

        const prompt = `
            Analyze the following log entries. For each log, classify it as 'benign' or 'malicious' and provide a concise reason.
            Return a JSON object containing a 'classifications' array.
            Each object in the array must have 'classification', 'reason', and the original 'logIndex' from this batch.

            Log entries to analyze:
            ${logDataForPrompt}
        `;

        try {
            const response = await generateContentWithRetry({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);

            if (parsedResponse.classifications && Array.isArray(parsedResponse.classifications)) {
                parsedResponse.classifications.forEach((item: any) => {
                    const batchIndex = item.logIndex;
                    if (batchIndex >= 0 && batchIndex < batch.length) {
                        const originalLogIndex = i + batchIndex;
                        allResults[originalLogIndex] = {
                            log: logs[originalLogIndex],
                            classification: item.classification as Classification,
                            reason: item.reason,
                        };
                    }
                });
            }
        } catch (error) {
            console.error(`Error processing batch starting at index ${i} after all retries:`, error);
        }

        processedCount += batch.length;
        const progress = (processedCount / logs.length) * 100;
        onProgress(progress);
    }

    // Fill any gaps for logs that failed to be classified
    return allResults.map((result, index) => {
        if (result) return result;
        return {
            log: logs[index],
            classification: 'benign', // Default to a safe value
            reason: 'This log could not be analyzed due to an API error.',
        };
    });
}