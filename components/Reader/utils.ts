import type {Content, Editor} from "@tiptap/vue-3"
import type {ShallowRef} from "vue"

export const saveScrollPosition = () => {
  const scrollPosition = window.scrollY
  if (scrollPosition === 0) return
  localStorage.setItem('scrollPosition', scrollPosition.toString())
}

export const restoreScrollPosition = () => {
  const scrollPosition = localStorage.getItem('scrollPosition');
  if (scrollPosition === null) return;
  document.documentElement.scrollTop = parseInt(scrollPosition);
}

export const setEditorContent = (
  editor: ShallowRef<Editor | undefined>,
  content: Content
) => {
  editor.value?.chain().setContent(content).run()
}
