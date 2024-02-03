import type {PinDefinition, PostPin} from "./types"

export default class Controller {
  sentencesApi = '/api/sentences'
  static booksApi = '/api/books'
  static pinsApi = '/api/pins'
  static definitionApi = '/api/definition'
  static setPinApi = '/api/books/set-pin'
  static aiInfuseApi = '/api/ai/infuse'
  static aiSimplifyApi = '/api/ai/simplify'

  slug = ''
  bookId: number | null

  constructor(slug: string) {
    this.slug = slug
    this.bookId = null
  }

  async fetchData(path: string, limit: number) {
    const qs = new URLSearchParams({
      s: this.slug,
      l: limit.toString(),
    })
    const response = await fetch(`${this.sentencesApi}/${path}?${qs}`, {
      method: 'GET',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    const headers = response.headers
    const bookId = headers.get('x-book-id')
    if (bookId) {
      this.bookId = +bookId
    }
    return data
  }

  async getInitialData(limit = 30) {
    return this.fetchData('initial', limit)
  }

  async getNextData(limit = 10) {
    return this.fetchData('paginate', limit)
  }

  static async paginateBooks() {
    const response = await fetch(`${this.booksApi}/paginate`, {
      method: 'GET',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    return data
  }

  static async postPin(data: PostPin) {
    const response = await fetch(`${this.pinsApi}`, {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const responseData = await response.json()
    return responseData
  }

  static async paginatePins(limit = 10) {
    const qs = new URLSearchParams({
      l: limit.toString(),
    })

    const response = await fetch(`${this.pinsApi}/paginate?${qs}`, {
      method: 'GET',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`
      }
    })

    let data = []

    if (response.status === 200) {
      data = await response.json()
    }

    return data
  }

  static async getDefinition(pin: string): Promise<PinDefinition> {
    const qs = new URLSearchParams({
      pin: pin,
    })
    const response = await fetch(`${this.definitionApi}?${qs}`)
    const data = await response.json()
    return data
  }

  static async setPin(bookId: number, pin: string) {
    const data = {
      bookId,
      pin,
    }
    const response = await fetch(`${this.setPinApi}`, {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const responseData = await response.json()
    return responseData
  }

  static async aiInfuse(sentence: string, bookId: number) {
    const data = {
      bookId,
      sentence,
    }

    const response = await fetch(`${this.aiInfuseApi}`, {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (response.status !== 200) {
      throw new Error('Invalid response')
    }

    const responseData = await response.json()
    return responseData
  }

  static async aiSimplify(sentence: string) {
    const data = {
      sentence,
    }
    const response = await fetch(`${this.aiSimplifyApi}`, {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (response.status !== 200) {
      throw new Error('Invalid response')
    }

    const responseData = await response.json()
    return responseData
  }
}
