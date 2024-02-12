import { defineStore, acceptHMRUpdate } from 'pinia'
import {Node} from "prosemirror-model"

interface NodeTarget {
  node: Node | null
  from: number
  to: number
  id: number
}


export const useTargetStore = defineStore('target', {
  state: () => ({
    node: null as Node | null,
    from: 0,
    to: 0,
    id: 0,
  }),

  actions: {
    set({node, from, to, id}: NodeTarget) {
      this.node = node
      this.from = from
      this.to = to
      this.id = id
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTargetStore, import.meta.hot))
}
