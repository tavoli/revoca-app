import {GoogleGenerativeAI} from '@google/generative-ai';
import { z } from 'zod'
import chalk from 'chalk';

const aiSentenceBody = z.object({
  sentence: z.string(),
})

/**
 * @openapi
 *
 * /ai/simplify:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: AI simplify a sentence
 *     description: Use AI to simplify a sentence
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
 *         description: The sentence was successfully simplified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generated:
 *                   type: string
 *                   description: The generated sentence
 *                   example: "Sample simplified Text"
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
  const result = await readValidatedBody(event, (body) => aiSentenceBody.safeParse(body))

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
    const generatedSentence = await generateContentAsStream(body.sentence);

    return sendStream(event, generatedSentence);
  } catch (error) {
    console.log(chalk.red(error));
    throw createError({
      message: 'An internal server error occurred',
      statusCode: 500,
    });
  }
});

async function generateContentAsStream(sentence: string) {
  const prompts = [
    `- Simplify the text to make it easier to understand.`,
    `- Ensure the meaning and essence of the text remains the same.`,
    `- Use simpler language.`,
    `\n\n${sentence}`,
  ];

  console.log(chalk.green('[OpenAI] Generating content as stream...'));

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: UserRole.SYSTEM,
        content: prompts.join('\n'),
      },
    ],
    temperature: 0.7,
    max_tokens: sentence.length + 100,
    stream: true,
  };

  const stream = await OpenAIStream(payload);

  return stream;
}
