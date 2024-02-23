import { GetObjectCommand } from '@aws-sdk/client-s3'
import {z} from 'zod'

const querySchema = z.object({
  s: z.string(),
})

/**
 * @openapi
 *
 * /books:
 *   get:
 *     security:
 *      - HeaderAuth: []
 *
 *     summary: Get books by pins
 *     description: Returns a list of books that match the pins ids.
 *
 *     parameters:
 *     - in: query
 *       name: s
 *       description: The slug of the book
 *
 *     responses:
 *       200:
 *         description: A list of books.
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *
 *       400:
 *         description: Zod validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       404:
 *         description: No books found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (!query.success) {
    throw createError({
      status: 400,
      data: query.error.issues,
    })
  }

  const user = event.context.user
  if (!user) {
    throw createError({
      status: 401,
    })
  }

  try {
    const file = await S3.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `books/${query.data.s}.json`,
    }))

    const body = await streamToString(file.Body)

    return JSON.parse(body)
  } catch (error) {
    throw createError({
      status: 500,
      data: error,
    })
  }
})

async function streamToString(stream: any) {
  const chunks = [];
  for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
