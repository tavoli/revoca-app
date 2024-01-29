import { Extension } from '@tiptap/core'

const createPopup = () => {
  const popupContainer = document.querySelector('.popup-container')
  if (popupContainer) return popupContainer
  const container = document.createElement('div')
  container.classList.add('popup-container', 'hidden', 'absolute', 'z-10', 'top-0', 'left-0')
  container.innerHTML = `
    <div class="popup absolute">
      <div class="popup-content w-64 h-32 bg-white p-2 rounded shadow-md overflow-auto">
        
      </div>
    </div>
  `
  document.body.appendChild(container)
  return container
}

const getPopup = () => {
  const popup = document.querySelector('.popup')
  if (popup) return popup as HTMLElement
}

const getPopupContent = () => {
  const popupContent = document.querySelector('.popup-content')
  if (popupContent) return popupContent as HTMLElement
}

function debounce(func: any, timeout = 300) {
  let timer: any
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(func, args)
    }, timeout)
  }
}

const debouncedOnTransaction = debounce((transaction: any, editor: any) => {
  const selection = transaction?.selection
  if (selection) {
    const {from, to} = selection
    const text = transaction.doc.textBetween(from, to)
    const {top, left, right} = editor.view.coordsAtPos(from)

    const popupContainer = createPopup()
    const popup = getPopup()
    const popupContent = getPopupContent()
    if (popup) {
      if (text.trim().length > 0) {
        const scrollPosition = window.scrollY
        const popupHeightInPx = window.getComputedStyle(popupContent as HTMLElement).height
        const popupHeight = parseInt(popupHeightInPx.replace('px', '')) + 10
        popup.style.top = `${(top + scrollPosition) - popupHeight}px`
        popup.style.left = `${left + (right - left) / 2}px`
        popupContainer?.classList.remove('hidden')
      } else {
        popupContainer?.classList.add('hidden')
      }
    }

    if (text.length > 0 && popupContent) {
      getSelectionMeaning(popupContent, text);
    }

  }
}, 500)

const hidePopup = () => {
  const popupContainer = createPopup()
  popupContainer?.classList.add('hidden')
  const content = getPopupContent()
  if (content) {
    content.innerHTML = ''
  }
}

export const SelectionPopup = Extension.create({
  onTransaction({transaction, editor}: any) {
    const {selection} = transaction
    if (!selection) return

    const {from, to} = selection
    const text = transaction.doc.textBetween(from, to)

    if (text.trim().length === 0) {
      hidePopup()
    } else {
      debouncedOnTransaction(transaction, editor)
    }
  },
})

const getSelectionMeaning = async (popupContent: HTMLElement, text: string) => {
  // TODO
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${text}`
  const response = await fetch(url)
  const data = await response.json()
  const meaning = data[0].meanings[0].definitions[0].definition
  popupContent.innerHTML = meaning
}
