import {GoogleGenerativeAI} from '@google/generative-ai';
import { z } from 'zod'
import chalk from 'chalk';

const requestBody = z.object({
  sentence: z.string(),
})

/**
 * @openapi
 *
 * /ai/split:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: AI split sentence stream
 *     description: Split a sentence into multiple sentences
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sentence:
 *                 type: string
 *                 format: string
 *           example:
 *             sentence: "Sample Pin Text"
 *
 *     responses:
 *       '200':
 *         description: A stream of sentences
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: string
 *               example: "Sample Pin Text"
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
  const result = await readValidatedBody(event, (body) => requestBody.safeParse(body))

  if (!result.success) {
    throw createError({
      message: 'Invalid body',
      data: result.error.issues,
      statusCode: 400,
    })
  }

  const body = result.data

  const user = event.context.user
  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  try {
    const stream = await generateContentAsStream(
      body.sentence,
    );

    return sendStream(event, stream)
  } catch (error) {
    console.log(chalk.red(error));
    throw createError({
      message: 'An internal server error occurred',
      statusCode: 500,
    });
  }
});

async function generateContentAsStream(sentence: string) {
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
    `- Split the following paragraph into many using \n to break lines:`,
    `\n\n${sentence}`,
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

