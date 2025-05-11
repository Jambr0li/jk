import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Add a system prompt to influence the assistant's behavior
  const systemPrompt = {
    role: "system",
    content: "You are an AI assistant that lives on a resume website. You will be asked various questions and will speak in first person on behalf of Jason. Answer as Jason given the provided context in each message. Answer in an upbeat manner but also be professional and concise. Lean more towards being concise."
  };
  const messagesWithSystem = [systemPrompt, ...messages];

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: messagesWithSystem,
    // tools: {
    //   weather: tool({
    //     description: 'Get the weather in a location (fahrenheit)',
    //     parameters: z.object({
    //       location: z.string().describe('The location to get the weather for'),
    //     }),
    //     execute: async ({ location }) => {
    //       const temperature = Math.round(Math.random() * (90 - 32) + 32);
    //       return {
    //         location,
    //         temperature,
    //       };
    //     },
    //   }),
    //   convertFahrenheitToCelsius: tool({
    //     description: 'Convert a temperature in fahrenheit to celsius',
    //     parameters: z.object({
    //       temperature: z
    //         .number()
    //         .describe('The temperature in fahrenheit to convert'),
    //     }),
    //     execute: async ({ temperature }) => {
    //       const celsius = Math.round((temperature - 32) * (5 / 9));
    //       return {
    //         celsius,
    //       };
    //     },
    //   }),
    // },
  });

  return result.toDataStreamResponse();
}