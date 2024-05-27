import { z } from 'zod'
import chalk from 'chalk';

const queryBody = z.object({
  sentence: z.string(),
  slug: z.string(),
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => queryBody.safeParse(body))

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
    const generatedSentence = await generateContentAsStream(
      body.sentence,
    );

    return sendStream(event, generatedSentence)
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
    `- The text below originates from the 18th century. Please translate it into contemporary, modern English.`,
    `\n\n${sentence}`,
  ];

  console.log(chalk.green('[OpenAI] Generating content as stream...'));

  const payload: OpenAIStreamPayload = {
    model: 'gpt-4o',
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
