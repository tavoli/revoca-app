<script setup lang="tsx">
import Controller from "~/utils/controller";
import type {Target} from "~/utils/types";

interface Props {
  slug: string
}

const props = withDefaults(defineProps<Props>(), {
  slug: '',
})

const target = useState<Target>('target', () => ({
  bookId: null,
  sentenceId: null,
  pin: null,
  context: null,
}))

const sentence = new Controller(props.slug)

const getInitialData = async () => {
  const data = await sentence.getInitialData(30)
  target.value.bookId = sentence.bookId
  return data
}

const nextData = async () => {
  const data = await sentence.getNextData(3)
  target.value.bookId = sentence.bookId
  return data
}

const getPins = async () => {
  const data = await Controller.paginatePins(100)
  return data
}

const getNextData = async () => {
  const data = await nextData()
  return data
}
</script>

<template>
  <Body class="mode-dark" />
  <main class="w-4/12 mx-auto">
    <Reader 
      :get-initial-data="getInitialData"
      :get-next-data="getNextData" 
      :get-pins="getPins"
    />
  </main>
</template>
