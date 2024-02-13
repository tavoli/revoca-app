import { defineStore, acceptHMRUpdate } from 'pinia'
import {Node} from "prosemirror-model"

export interface NodeTarget {
  node: Node | null
  from: number
  to: number
  id: number
  isBlinded: boolean
}


export const useTargetStore = defineStore('target', {
  state: () => ({
    node: null as Node | null,
    from: 0,
    to: 0,
    id: 0,
    isBlinded: false
  }),

  actions: {
    set(target: Partial<NodeTarget>) {
      this.$patch(target)
    },

    blind() {
      this.isBlinded = true
    },

    unblind() {
      this.isBlinded = false
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTargetStore, import.meta.hot))
}
