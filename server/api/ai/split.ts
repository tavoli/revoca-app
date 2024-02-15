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
  const prompts = [
    `- Split the following paragraph into many using \n to break lines:`,

    `\n\n${sentence}`,
  ];

  console.log(chalk.green('[OpenAI] Generating content as stream...'));

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo-16k',
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
