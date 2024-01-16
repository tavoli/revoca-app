const privateRoutes = [
  '/api/books',
  '/api/pinwords',
  '/api/pinwords/paginate',
  '/api/sentences/paginate',
]

/**
const publicRoutes = [
  '/api/books/search',
  '/api/books/paginate',
] */

export default defineEventHandler(async (event) => {
  const currentRequest = getRequestURL(event)
  const currentRoute = currentRequest.pathname

  if (privateRoutes.includes(currentRoute)) {
    const token = getCookie(event, 'session')

    if (!token) {
      throw new Error('unauthorized')
    }

    let user: User;

    try {
      user = await jwt.verifyToken(token)
    } catch (error) {
      console.error(error)
      throw new Error('unauthorized')
    }

    event.context.user = user
  }
})


