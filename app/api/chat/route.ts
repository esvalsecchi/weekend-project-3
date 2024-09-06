import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:5000/v1",
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const safeMessages = Array.isArray(messages) ? messages : [];

  console.log(safeMessages);

  const response = await openai.chat.completions.create({
    model: "mistral-7b-v0.1.Q6_K.gguf",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a professional storyteller who has been hired to write a series of short stories for a new anthology. The stories should be captivating, imaginative, and thought-provoking. They should explore a variety of themes and genres, from science fiction and fantasy to mystery and romance. Each story should be unique and memorable, with compelling characters and unexpected plot twists.`,
      },
      ...safeMessages,
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}