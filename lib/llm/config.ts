// import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// export const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINIAI_API_KEY,
});

export const AI_MODEL = "gemini-2.5-flash";
