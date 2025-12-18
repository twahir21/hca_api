import { Elysia, t } from "elysia";
import Fuse from "fuse.js";

// const faq = [
//   { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page.", keywords: ["reset", "password", "forgot", "login"], },
//   { q: "What is your refund policy?", a: "Refunds are available within 30 days of purchase.", keywords: ["return", "policy", "refund", "exchange"], }
// ];

// const fuse = new Fuse(faq, {
//   keys: ["q"],
//   includeScore: true,
//   threshold: 0.4 // lower threshold = stricter matching
// });

export const faqData = [
  {
    question: "What is the return policy?",
    keywords: ["return", "policy", "refund", "exchange"],
    answer: "Our return policy allows returns within 30 days of purchase with the original receipt.",
  },
  {
    question: "How do I reset my password?",
    keywords: ["reset", "password", "forgot", "login"],
    answer: "You can reset your password by clicking 'Forgot Password' on the login screen.",
  },
];

// Configure the search options
const fuseOptions = {
  keys: [
    { name: 'question', weight: 0.7 }, // Prioritize the question field
    { name: 'keywords', weight: 0.3 }  // Search keywords with less weight
  ],
  threshold: 0.3, // Adjust for fuzziness (lower is stricter, higher is more forgiving)
  ignoreLocation: true,
  includeScore: true,
};

export const fuse = new Fuse(faqData, fuseOptions);

export function searchFAQ(query: string) {
  // .search() returns an array of matches with their score and original item
  return fuse.search(query);
}

export const botPlugin = new Elysia()
  .get('/bot', ({ query }) => {
    const userQuery = query.q;
    
    if (!userQuery) {
      return { status: 'error', message: 'Query parameter "q" is required.' };
    }

    const results = searchFAQ(userQuery);

    if (results.length > 0) {
      // Return the best match (lowest score is best)
      const bestMatch = results[0].item; 
      
      return { 
        status: 'success', 
        answer: bestMatch.answer,
        matched_question: bestMatch.question,
      };
    }

    // Fallback response for no good match
    return { 
      status: 'not_found', 
      answer: "Sorry, I couldn't find an answer to that question. Please try rephrasing.",
    };
  }, {
    // Optional: Add validation for the query parameter
    query: t.Object({
      q: t.String(),
    })
  })

// export const botPlugin = new Elysia()
//   .post("/bot", ({ body }) => {
//     const { question } = body as { question: string };
//     const results = fuse.search(question);
//     if (results.length > 0) {
//       const best = results[0];
      
//       if (!best.score) return { answer: "No match found", confidence: 0 }

//       const confidence = 1 - best.score; // convert Fuse score to confidence
//       return confidence > 0.7
//         ? { answer: best.item.a, confidence }
//         : { answer: "No match found", confidence };
//     }
//     return { answer: "No match found", confidence: 0 };
//   })
