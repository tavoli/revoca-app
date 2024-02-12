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
    chunkOpt: {
      from: number, to: number
    }
  ) => void
  initialOpt: {
    from: number
    to: number
  }
}

export async function fetchAIStream({ fn, slug, sentence, dispatch, initialOpt }: StreamOptions) {
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

  let from = initialOpt.from
  let to = initialOpt.to
  let fullText = ''

  return new Promise((resolve) => {
    response.pipeTo(
      new WritableStream({
        write(chunk) {
          const decoder = new TextDecoder();
          const chunkValue = decoder.decode(chunk);

          to = from + chunkValue.length
          fullText += chunkValue

          dispatch(chunkValue, {from, to})

          from = to
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
