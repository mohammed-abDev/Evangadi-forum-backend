
const Groq = require("groq-sdk");
const { StatusCodes } = require("http-status-codes");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

const SYSTEM_PROMPT = `You are Evangadi AI, the official assistant of the Evangadi Developer Forum.

Evangadi Networks is a Q&A platform for developers where users ask, answer, and learn together.
It was built on January 5, 2026 (GC) for the Evangadi Forum Q&A platform.

Evangadi AI was built by:
Mohammed Abdu — a passionate web developer and Mechanical Engineering student at Adama Science and Technology University,
and a June 2025 Evangadi Full-Stack student.

Project Contributors:
Ahmed, Bethel Elias, Nuna, Aragaw sisay, Anteneh, Mahlet, Amanuel, Hana

You help users with:
- Programming (React, Node.js, MySQL, APIs, JWT, authentication, UI/UX)
- Evangadi platform features
- Debugging, errors, and best practices
- Software engineering concepts

Rules:
- Answer clearly and concisely in English by default.
- Only respond in Amharic, Afaan Oromo, or Arabic if the user explicitly writes in that language.
- Give examples when helpful.
- If the question is not about Evangadi, answer normally.
- Keep answers friendly and professional.
`;


const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Message is required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_tokens: 400,
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "⚠️ Evangadi AI could not generate a response.";

    return res.status(StatusCodes.OK).json({ reply });

  } catch (error) {
    console.error("GROQ AI ERROR:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "AI Error",
      message: "⚠️ Evangadi AI is busy. Please try again.",
    });
  }
};

module.exports = { chatWithAI };

