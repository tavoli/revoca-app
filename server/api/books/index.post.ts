import {PutObjectCommand} from '@aws-sdk/client-s3'
import { z } from 'zod'

import {insertBook} from '~/server/repositories/book/book.repository'

const bookBodySchema = z.object({
  title: z.string(),
  image: z.object({
    data: z.string(),
    type: z.string(),
  }).optional(),
  ops: z.array(z.object({
    insert: z.any(),
    attributes: z.any().optional(),
  })),
  slug: z.string(),
})

/**
 * @openapi
 *
 * /books:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Create a new book
 *     description: Create a new book
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               ops:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     insert:
 *                       type: string
 *                       description: The text to insert
 *                     attributes:
 *                       type: object
 *                       description: The attributes of the text
 *               slug:
 *                 type: string
 *           example:
 *             title: "Sample Title"
 *             ops: [ { insert: "Sample text" } ]
 *             slug: "sample-title"
 *     
 *     responses:
 *       '200':
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ok'
 *
 *       '400':
 *         description: The request was malformed
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
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => bookBodySchema.safeParse(body))

  if (!result.success) {
    throw createError({
      message: 'Error creating book',
      data: result.error.issues,
      statusCode: 500,
    })
  }

  const user = event.context.user

  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const body = result.data

  await db.transaction().execute(async (trx) => {
    try {
      let imageUrl = 'https://via.placeholder.com/150'

      if (body.image?.data && body.image?.type) {
        const bufferFile = Buffer.from(body.image.data, 'base64')

        await S3.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `images/${body.slug}.${body.image.type}`,
          Body: bufferFile,
          ContentType: `image/${body.image.type}`,
          ACL: 'public-read',
        }))

        imageUrl = `https://pub-a386a4298cf14419bb7b676a09551997.r2.dev/images/${body.slug}.${body.image.type}`
      }

      
      const book_id = await insertBook(trx, {
        title: body.title,
        slug: body.slug,
        image_url: imageUrl,
        user_id: user.id,
      })

      if (!book_id) {
        throw createError({
          message: 'Error creating book',
          statusCode: 500,
        })
      }

      await S3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `books/${body.slug}.json`,
        Body: JSON.stringify(body.ops),
        ContentType: 'application/json',
        ACL: 'public-read',
      }))


      await kv.zadd(
        'titles',
        { member: body.title, score: book_id },
      );
    } catch (error) {
      console.error(error)
      throw createError({
        message: 'Error creating book',
        statusCode: 500,
      })
    }
  })

  return { ok: true }
})
