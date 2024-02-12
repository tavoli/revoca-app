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
  }),

  actions: {
    setCurrent(definition: PinDefinition) { 
      this.definition = definition
    },

    find(selection: string): Promise<PinDefinition> {
      const slug = useSlug()
      const DATA_KEY = factoryDataKeys(slug)

      const pinsCache = useNuxtData(DATA_KEY.PINS)
      const fromCache = pinsCache.data.value.find(
        ({pin}: PinDefinition) => pin === selection
      )

      if (!fromCache) {
        return this.fetch(selection)
      }

      return Promise.resolve(fromCache)
    },

    onSelection(selection: string) {
      this.find(selection).then((definition) => {
        this.setCurrent(definition)

        const slug = useSlug()
        const DATA_KEY = factoryDataKeys(slug)

        const pinsCache = useNuxtData(DATA_KEY.PINS)

        pinsCache.data.value = [
          ...pinsCache.data.value.filter(
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
