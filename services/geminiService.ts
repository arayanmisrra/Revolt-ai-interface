
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEMINI_MODEL } from '../constants';
import { Message, Role } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function simulates a chat history for the generateContent API
const buildChatHistory = (messages: Message[]) => {
    return messages.map(msg => ({
        role: msg.role === Role.AI ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
};

export const generateResponse = async (prompt: string, history: Message[]): Promise<string> => {
    try {
        // We are using generateContent here to simulate a chat-like turn.
        // The history is manually constructed. For a real chat application,
        // ai.chats.create() would be more stateful.
        const pastMessages = buildChatHistory(history);
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [...pastMessages, { role: 'user', parts: [{text: prompt}]}],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        const text = response.text;
        if (!text) {
             throw new Error("Empty response from API.");
        }
        return text;

    } catch (error) {
        console.error("Gemini API error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }
};
