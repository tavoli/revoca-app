import { z } from 'zod'
import chalk from 'chalk';

const aiSentenceBody = z.object({
  sentence: z.string(),
  slug: z.string(),
})

/**
 * @openapi
 *
 * /ai/infuse:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: AI infuse pins to a sentence
 *     description: Infuse pins to a sentence
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 format: string
 *                 minimum: 1
 *               sentence:
 *                 type: string
 *                 format: string
 *           example:
 *             slug: 'the-quick-brown-fox'
 *             sentence: "Sample Pin Text"
 *
 *     responses:
 *       '200':
 *         description: The sentence was successfully pinned
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

const REPEAT_COUNT = 3;

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

  const cachePinsKey = pinGetKey(body.slug);
  const pins = await kv.zrange(cachePinsKey, 0, 2, { withScores: true }) as any[];

  // Extract pins with scores as an array of objects
  const pinsWithScore = updateScores(pins, (score) => score);

  // Check if every pin has a score of 10 or 0
  const everyPinHasScoreEqualOrLess = pinsWithScore.every(({ score }) => score <= REPEAT_COUNT);
  const everyPinHasScoreEqualToZero = pinsWithScore.every(({ score }) => score === 0);

  // Prepare updated scores based on conditions
  let updatedScores;

  if (everyPinHasScoreEqualToZero) {
    updatedScores = updateScores(pins, () => +Date.now());
  } else if (everyPinHasScoreEqualOrLess) {
    updatedScores = updateScores(pins, (eachScore) => eachScore - 1);
  } else {
    updatedScores = updateScores(pins, () => REPEAT_COUNT);
  }

  // Update scores
  if (pins.length > 0) {
    const [first, ...rest] = updatedScores;
    await kv.zadd(cachePinsKey, first, ...rest);
  }

  if (pins.length > 0) {
    try {
      const generatedSentence = await generateContentAsStream(
        body.sentence,
        pinsWithoutScores(pins)
      );

      console.log(chalk.green(pinsWithoutScores(pins)));

      return sendStream(event, generatedSentence)
    } catch (error) {
      console.log(chalk.red(error));
      throw createError({
        message: 'An internal server error occurred',
        statusCode: 500,
      });
    }
  }

  throw createError({
    message: 'No pins found',
    statusCode: 400,
  });
});

async function generateContentAsStream(sentence: string, pins: string[]) {
  const prompts = [
    `- Infuse in the text with creative touch, seamlessly weaving the words: ${pins.toString()}.`,
    "- Ensure the meaning and essence of the text remains the same.",
    `- Use simpler language.`,
    `\n\n${sentence}`,
  ];

  console.log(chalk.green('[OpenAI] Generating content as stream...'));

  const payload: OpenAIStreamPayload = {
    // model: 'gpt-4-0125-preview',
    model: 'gpt-4-turbo-preview',
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

function updateScores(pins: any[], fn: (currentScore: number) => number) {
  return pins.reduce((acc, pin, index) => {
    if (index % 2 === 0) {
      acc.push({ member: pin, score: fn(pins[index + 1]) });
    }
    return acc;
  }, []) as { member: string; score: number }[];
}

function pinsWithoutScores(pins: any[]) {
  return pins.reduce((acc, pin, index) => {
    if (index % 2 === 0) {
      acc.push(pin);
    }
    return acc;
  }, []) as string[];
}
