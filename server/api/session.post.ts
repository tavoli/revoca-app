import { nanoid } from "nanoid";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const user = {
      id: nanoid(8),
      username: body.username,
    };

    const existingUser = await getUserByUsername(user.username);

    const tokenPayload = existingUser || user;

    const token = jwt.createToken(tokenPayload);

    setCookie(event, 'session', token, jwt.cookieConfig);

    if (!existingUser) {
      await insertUser(user);
    }
      
    return {
      statusCode: 200,
      body: { message: 'success' },
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: { message: 'error' },
    };
  }
});
