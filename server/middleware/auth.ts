import {Jwt} from "jsonwebtoken"

const privateRoutes = [
  '/api/books',
  '/api/books/by-pins',
  '/api/pins',
  '/api/pins/paginate',
  '/api/sentences/paginate',
]

/**
const publicRoutes = [
  '/api/books/search',
  '/api/books/paginate',
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


