import { defineStore, acceptHMRUpdate } from 'pinia'

interface PinDefinition {
  id: number
  pin: string
  synonyms: string[]
  definitions: string[]
  partsOfSpeech: string[]
  selected: boolean
}

export const useDefinitionStore = defineStore('definition', {
  state: () => ({
    definition: null as PinDefinition | null,
    definitions: [] as PinDefinition[],
  }),

  actions: {
    setCurrent(definition: PinDefinition) { 
      this.definition = definition
    },

    find(selection: string): Promise<PinDefinition> {
      const def = this.definitions.find(
        ({pin}: PinDefinition) => pin === selection
      )

      if (!def) {
        return this.fetch(selection)
      }

      return Promise.resolve(def)
    },

    onSelection(selection: string) {
      this.find(selection).then((definition) => {
        this.setCurrent(definition)

        this.definitions = [
          ...this.definitions.filter(
            ({pin}: PinDefinition) => pin !== selection
          ),
          definition,
        ]
      })
    },

    async fetch(pin: string): Promise<PinDefinition> {
      const qs = new URLSearchParams({pin})
      const res = await fetch(`/api/definition?${qs}`)
      const data = await res.json()
      return data
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDefinitionStore, import.meta.hot))
}
