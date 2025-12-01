import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WeatherResponse } from "@/lib/types/weather";
import { formatWeatherForLLM } from "@/lib/format-weather-for-llm";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
  baseURL: process.env.AI_API_BASE_URL || "https://ai.hackclub.com/proxy/v1",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const weatherData: WeatherResponse = body.weatherData;
    const previousPrompt: string | undefined = body.previousPrompt;
    const formattedWeather = formatWeatherForLLM(weatherData);

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are a helpful weather assistant. Provide a brief, conversational summary of the current conditions and upcoming weather based on the data provided. Try not to exceed 20 tokens in your output, but prioritize clarity. Hard limit 35 tokens. The current unit is Fahrenheit format temps as [TEMP]º. Always use complete sentences, but remain professional. Do NOT use ANY data not given by the next prompt. ${
            previousPrompt &&
            "I have also included the previous summary for context. If only minor changes exist, ALWAYS just slot the new data into the previous summary without changing the layout at all. If there are major changes, you may modify it, but minimize the impact the best you can."
          } EXAMPLE: It is mostly sunny through the afternoon, with wind gusts up to 12 mph, and a high of 75°. `,
        },
        {
          role: "user",
          content: formattedWeather,
        },
        {
          role: "user",
          content: `${
            previousPrompt || "IGNORE THIS, FOLLOW INSTRUCTIONS ABOVE."
          }`,
        },
      ],
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error("Error calling AI API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
