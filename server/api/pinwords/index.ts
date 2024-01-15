export default defineEventHandler(async (event) => {
  const body = await readBody(event)


  console.log(body)

  return {
    statusCode: 200,
    body: { message: 'success' }
  }
})
