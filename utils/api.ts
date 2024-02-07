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

