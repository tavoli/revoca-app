import type {Op} from "quill/core";

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

export const fetchBook = (slug: string) =>
  $fetch(`/api/books`, {
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

export async function* aiSentence({ fn, slug, text }: any) {
  const response = await fetch(`/api/ai/${fn}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      sentence: text,
      slug,
    })
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Processing the chunk
      const decoder = new TextDecoder();
      const chunkValue = decoder.decode(value);

      // Yielding the processed chunk
      yield chunkValue;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* aiPrompt({ prompt, context }: any) {
  const response = await fetch(`/api/ai/definition`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      prompt,
      context,
    })
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Processing the chunk
      const decoder = new TextDecoder();
      const chunkValue = decoder.decode(value);

      // Yielding the processed chunk
      yield chunkValue;
    }
  } finally {
    reader.releaseLock();
  }
}

export const postPin = (body: any) =>
  $fetch(`/api/pins`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body,
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
  ops: Op[]
  slug: string
  title: string
}

export const postBook = (body: NewBook) =>
  $fetch(`/api/books`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body,
  })


export const postScrollPosition = (slug: string, y: number) =>
  $fetch(`/api/scroll-pos`, {
    method: 'POST',
    body: {
      slug,
      y,
    },
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
  })

export const fetchScrollPosition = (slug: string): Promise<number> =>
  $fetch(`/api/scroll-pos?slug=${slug}`, {
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
  })
  .then((y) => y as number)
  .catch(() => 0)
