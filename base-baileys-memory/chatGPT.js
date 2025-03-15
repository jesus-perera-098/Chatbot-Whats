require("dotenv").config();  

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chat = async (prompt, text) => {
  try {
    await delay(1000); // Espera 1 segundo antes de hacer la petición
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Error al conectar con OpenAI:", err);
    return "ERROR";
  }
};

module.exports = chat;
