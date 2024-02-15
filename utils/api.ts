export const fetchPinsPaginate = () => 
  $fetch(`/api/pins/paginate`, {
    query: {
      l: 100,
    },
    headers: {
      Authorization: `${useCookie('token').value || localStorage.getItem('token')}`,
    },
  })
  .catch(() => []);

export const fetchPinned = (slug: string) =>
  $fetch(`/api/books/pinned`, {
    query: {
      s: slug,
    },
  })
  .catch(() => []);

export const fetchSentences = (slug: string) =>
  $fetch(`/api/sentences`, {
    query: {
      s: slug,
    },
    headers: {
      Authorization: `${useCookie('token').value || localStorage.getItem('token')}`,
    },
  })
  .catch(() => []);

export const fetchTogglePin = (
  {pin, slug}: any,
  optmisticUpdate: (pin: string) => void
) =>
  $fetch(`/api/books/toggle-pin`, {
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    method: 'POST',
    body: {
      pin,
      slug,
    },
    onRequest() {
      optmisticUpdate(pin)
    },
  })

interface StreamOptions {
  fn: string
  slug: string
  sentence: string
  dispatch: (
    chunk: string,
    chunkFrom: number
  ) => void
  from: number
}

export async function fetchAIStream({ fn, slug, sentence, dispatch, from }: StreamOptions) {
  const response = await $fetch<any>(`/api/ai/${fn}`, {
    responseType: "stream",
    method: "POST",
    headers: {
      "Authorization": `${localStorage.getItem('token')}`
    },
    body: {
      sentence,
      slug,
    }
  })

  let chunkFrom = from
  let fullText = ''

  return new Promise((resolve) => {
    response.pipeTo(
      new WritableStream({
        write(chunk) {
          const decoder = new TextDecoder();
          const chunkValue = decoder.decode(chunk);

          fullText += chunkValue

          dispatch(chunkValue, chunkFrom)

          chunkFrom = from + chunkValue.length
        },
        close() {
          resolve(fullText)
        },
      })
    );
  })
}

export const postPin = (body: any, optmisticUpdate: () => void) =>
  $fetch(`/api/pins`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body,
    onRequest() {
      optmisticUpdate()
    },
  })

export const postAiSentence = async (body: any) => {
  const generatedId = await $fetch(`/api/sentences`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body,
  })

  return generatedId
}

interface NewBook {
  title: string
  imageSrc: string
  sentences: string[]
  slug: string
}

export const postBook = (body: NewBook) =>
  $fetch(`/api/books`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body,
  })

