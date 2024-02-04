import {GoogleGenerativeAI} from '@google/generative-ai';
import { z } from 'zod'
import chalk from 'chalk';

const aiSentenceBody = z.object({
  sentence: z.string(),
  bookId: z.number(),
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
 *               bookId:
 *                 type: integer
 *                 format: int
 *                 minimum: 1
 *               sentence:
 *                 type: string
 *                 format: string
 *           example:
 *             bookId: 1
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

  const cachePinsKey = `books:${body.bookId}:pins`;
  const pins = await kv.zrange(cachePinsKey, 0, 2, { withScores: true }) as any[];

  // Extract pins with scores as an array of objects
  const pinsWithScore = updateScores(pins, (score) => score);

  // Check if every pin has a score of 10 or 0
  const everyPinHasScoreEqualOrLessThan10 = pinsWithScore.every(({ score }) => score <= 10);
  const everyPinHasScoreEqualToZero = pinsWithScore.every(({ score }) => score === 0);

  // Prepare updated scores based on conditions
  let updatedScores;

  if (everyPinHasScoreEqualToZero) {
    updatedScores = updateScores(pins, () => +Date.now());
  } else if (everyPinHasScoreEqualOrLessThan10) {
    updatedScores = updateScores(pins, (eachScore) => eachScore - 1);
  } else {
    updatedScores = updateScores(pins, () => 10);
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
  const MODEL_NAME = "gemini-pro";
  const API_KEY = process.env.GEMINI_API_KEY as string;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.95,
    topK: 1,
    topP: 1,
    maxOutputTokens: 500,
    candidateCount: 1,
    stopSequences: ['[DONE]'],
  };

  const prompts = [
    "- Keep the author style",
    "- Keep the text length similar to the original.",
    "- Ensure the text is coherent to the original.",
    "- Ensure the meaning and essence of the text remains the same.",
    `- Incorporate in the text with creative touch, seamlessly weaving the words: {${pins.toString()}}.`,
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
