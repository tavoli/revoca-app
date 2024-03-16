import {Jwt} from "jsonwebtoken"

const privateRoutes = [
  '/api/books',
  '/api/books/by-pins',
  '/api/books/toggle-pin',
  '/api/books/paginate',
  '/api/pins',
  '/api/pins/paginate',
  '/api/sentences/paginate',
  '/api/sentences/initial',
  '/api/sentences',
  '/api/ai/infuse',
  '/api/ai/simplify',
  '/api/ai/sentence',
  '/api/ai/split',
  '/api/ai/definition',
  '/api/ai/modernize',
]

/**
const publicRoutes = [
  '/api/books/search',
] */

export default defineEventHandler((event) => {
  const currentRequest = getRequestURL(event)
  const currentRoute = currentRequest.pathname

  if (privateRoutes.includes(currentRoute)) {
    const token = getHeader(event, 'Authorization')

    if (!token) {
      setResponseStatus(event, 401)
      return { error: 'Unauthorized' }
    }

    let user: Jwt;

    try {
      user = jwt.verifyToken(token)
    } catch (error) {
      console.error(error)
      setResponseStatus(event, 401)
      return { error: 'Unauthorized' }
    }

    event.context.user = user
  }
})


