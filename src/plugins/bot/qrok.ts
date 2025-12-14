import Elysia from "elysia";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "llama-3.1-8b-instant",
  });
}


async function groqFunc(text: string) {
    return groq.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    }).then( t => t.data[0].embedding)
}

export const groqPlugin = new Elysia()
    .post("/groq-bot", async ({ body }: { body: { question: string }}) => {
        // const vector = await groqFunc(body.question);
        // console.log("vector is: ", vector)
        // return { vector }
        return await getGroqChatCompletion()
    })



// import { GoogleGenAI } from "@google/genai";

// async function mainGemini() {

//     const ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API!
//     });

//     const response = await ai.models.embedContent({
//         model: 'gemini-embedding-001',
//         contents: 'What is the meaning of life?',
//     });

//     console.log(response.embeddings?.map(r => r.values));
// }

// await mainGemini();

