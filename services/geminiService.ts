import { GoogleGenAI } from "@google/genai";
import { UserRole } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Generates an onboarding summary and strategic implications based on the user's role and company.
   */
  generateOnboardingGuidance: async (
    name: string,
    role: UserRole,
    company: string
  ): Promise<string> => {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        You are an expert logistics consultant.
        A new user named "${name}" has joined the platform.
        Role: ${role}
        Company: ${company}

        Please generate a concise 2-paragraph onboarding welcome message.
        1. First paragraph: Welcome them warmly and acknowledge their specific role importance.
        2. Second paragraph: List 3 key strategic implications or responsibilities they likely face in the current maritime/logistics climate (e.g., supply chain resilience, incoterms, digital documentation).
        
        Keep it professional, encouraging, and formatted in Markdown.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || "Welcome to the platform. We are glad to have you here.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Welcome! We are currently unable to generate your personalized onboarding insights, but we are thrilled to have you aboard.";
    }
  }
};
