import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WeatherResponse } from "@/lib/types/weather";
import { formatWeatherForLLM } from "@/lib/format-weather-for-llm";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const weatherData: WeatherResponse = await request.json();
    const formattedWeather = formatWeatherForLLM(weatherData);

    const response = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful weather assistant. Provide a brief, conversational summary of the current conditions and upcoming weather based on the data provided. Try not to exceed 50 tokens in your output, but prioritize clarity. Hard limit 75 tokens. The current unit is Fahrenheit, the user knows this. Always use complete sentences, but remain very professional. Do NOT use ANY data not given by the next prompt. EXAMPLE: It is mostly sunny through the afternoon, with wind gusts up to 12 mph, and a high of 75°.",
        },
        {
          role: "user",
          content: formattedWeather,
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
