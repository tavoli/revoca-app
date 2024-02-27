import { z } from 'zod'

import {insertPin} from '~/server/repositories/pin/pin.repository'

const pinBodySchema = z.object({
  pin: z.string().min(1).max(255),
  slug: z.string().min(1),
})

/**
 * @openapi
 *
 * /pins:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Create a new pin
 *     description: Create a new pin
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
 *               pin:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *           example:
 *             id: 1
 *             slug: 'the-quick-brown-fox'
 *             pin: 'quick'
 *
 *     responses:
 *       '200':
 *         description: The pin was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ok'
 *       '400':
 *         description: The request body was invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
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
  const result = await readValidatedBody(event, (body) => pinBodySchema.safeParse(body))

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

  const pin = {
    user_id: user.id,
    slug: body.slug,
    pin: body.pin,
    is_active: true,
  }

  try {
    await insertPin(db, pin)
  } catch (e) {
    console.log(e)
    throw createError({
      message: 'Error creating pin',
      statusCode: 500,
    })
  }

  return { ok: true }
})
