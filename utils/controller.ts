export default class Controller {
  baseApi = '/api/sentences'
  slug = ''

  constructor(slug: string) {
    this.slug = slug
  }

  async fetchData(path: string, limit: number) {
    const qs = new URLSearchParams({
      s: this.slug,
      l: limit.toString(),
    })
    const response = await fetch(`${this.baseApi}/${path}?${qs}`, {
      method: 'GET',
      headers: {
        'Authorization': `${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    return data
  }

  async getInitialData(limit = 30) {
    return this.fetchData('initial', limit)
  }

  async getNextData(limit = 10) {
    return this.fetchData('paginate', limit)
  }
}
