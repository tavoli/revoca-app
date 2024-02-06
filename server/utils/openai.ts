import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

export enum UserRole {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
};

export type ChatGPTMessage = {
  role: UserRole.USER | UserRole.SYSTEM | UserRole.ASSISTANT;
  content: string;
}

export type OpenAIStreamPayload = {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content || "";
              console.log(text);
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        }

        const parser = createParser(onParse);
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    return stream;
  } catch (error) {
    console.log(error);
  }
}
