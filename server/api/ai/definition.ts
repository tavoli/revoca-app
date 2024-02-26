import {GoogleGenerativeAI} from '@google/generative-ai';
import chalk from 'chalk';
import { z } from 'zod'

const bodySchema = z.object({
  prompt: z.string().min(1),
  context: z.string().min(3)
})

/**
 * @openapi
 *
 * /ai/definition:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: AI Definition
 *     description: Generate a definition for a prompt using the context.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 format: string
 *                 minimum: 1
 *               context:
 *                 type: string
 *                 format: string
 *           example:
 *             prompt: "Sample Pin Text"
 *             context: "Sample Context Text"
 *
 *     responses:
 *       '200':
 *         description: A stream with the definition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generated:
 *                   type: string
 *                   description: The generated sentence
 *                   example: "Sample Pin Text"
 *
 *       '400':
 *         description: The request body was invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (!result.success) {
    throw createError({
      data: result.error,
      status: 400,
    })
  }

  try {
    const generatedSentence = await OpenAIGenerateContentAsStream(result.data);

    return sendStream(event, generatedSentence);
  } catch (error) {
    console.log(chalk.red(error));
    throw createError({
      message: 'An internal server error occurred',
      statusCode: 500,
    });
  }
});

interface DefinitionRequest {
  prompt: string;
  context: string;
}

async function GeminiGenerateContentAsStream({ prompt, context }: DefinitionRequest) {
  const MODEL_NAME = "gemini-pro";
  const API_KEY = process.env.GEMINI_API_KEY as string;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.95,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
    candidateCount: 1,
    stopSequences: ['[DONE]'],
  };

  const prompts = [
    `- Provide a short-hand definition for the prompt.`,
    `- Use the context to aproximate the definition.`,

    `Prompt: ${prompt}`,
    `Context: ${context}`,
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: prompts.join("\n") }] }],
          generationConfig,
        });

        for await (const chunk of result.stream) {
          if (chunk?.candidates?.length) {
            for (const candidate of chunk.candidates) {
              console.log(
                chalk.yellow(
                  `Candidate: ${candidate.content.parts}`
                )
              );

              const text = candidate.content.parts.map(part => part.text).join("");
              const encodedText = new TextEncoder().encode(text);
              controller.enqueue(encodedText);
            }
          } else {
            const encodedText = new TextEncoder().encode('ERROR: No candidates found.');
            controller.enqueue(encodedText);
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
}

async function OpenAIGenerateContentAsStream({ prompt, context }: DefinitionRequest) {
  const prompts = [
    `- Define the prompt succinctly.`,
    `- Use the context to refine the definition.`,

    `Prompt: ${prompt}`,
    `Context: ${context}`,
  ];

  console.log(chalk.green('[OpenAI] Generating content as stream...'));

  const payload: OpenAIStreamPayload = {
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: UserRole.SYSTEM,
        content: prompts.join('\n'),
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
    stream: true,
  };

  const stream = await OpenAIStream(payload);

  return stream;
}



