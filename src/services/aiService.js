import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyAe95toGg6wJ7pnUwteneURX1WSFsWhWyU';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getGeminiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const callGemini = async (prompt, retries = 3) => {
  // Try 2.0-flash-lite first (faster/higher limits), then 2.0-flash, then flash-latest
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest'];
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const currentModel = models[Math.min(attempt, models.length - 1)];
    
    try {
      const response = await axios.post(getGeminiUrl(currentModel), {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      return response.data.candidates[0].content.parts[0].text;
    } catch (err) {
      if (err.response?.status === 429 && attempt < retries) {
        // Base delay 5 seconds, doubling each time (5s, 10s, 20s) to comfortably clear free tier 15 RPM rate limits
        const waitTime = Math.pow(2, attempt) * 5000;
        console.warn(`[AI Service] Rate limited on ${currentModel}. Retrying in ${waitTime/1000}s...`);
        await delay(waitTime);
        continue;
      }
      console.error('[AI Service] API Error:', err.response?.data || err.message);
      throw err;
    }
  }
};

export const generateSummary = async (topic, subject) => {
  const prompt = `Generate a concise, well-structured study summary for the topic "${topic}" under the subject "${subject}". Include key concepts, important points, and a brief explanation. Format with clear headings and bullet points using markdown.`;
  return callGemini(prompt);
};

export const generateQuestions = async (topic, subject, count = 10) => {
  const prompt = `Generate ${count} practice questions for the topic "${topic}" under the subject "${subject}". Include a mix of multiple choice, short answer, and conceptual questions. For multiple choice, provide 4 options and indicate the correct answer. Format clearly with markdown.`;
  return callGemini(prompt);
};

export const generateFlashcards = async (topic, subject, count = 8) => {
  const prompt = `Generate ${count} flashcards for the topic "${topic}" under the subject "${subject}". Return as a JSON array where each object has "front" (question) and "back" (answer) keys. Only return the JSON array, no other text.`;
  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(response);
  } catch {
    return [{ front: 'Error parsing flashcards', back: response }];
  }
};

export const askQuestion = async (question, context = '') => {
  const prompt = context
    ? `You are a helpful study assistant. The student is studying: ${context}. Answer this question clearly and concisely: ${question}`
    : `You are a helpful study assistant. Answer this question clearly and concisely: ${question}`;
  return callGemini(prompt);
};
