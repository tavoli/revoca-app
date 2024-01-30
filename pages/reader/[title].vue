<script setup lang="tsx">
import Controller from "~/utils/controller";
import ReaderController from "./ReaderController.vue"
import TopMenu from "./TopMenu.vue"
import type {Target} from "~/utils/types";

const query = useRequestURL()

const target = useState<Target>('target', () => ({
  bookId: null,
  sentenceId: null,
  pin: null,
  context: null,
}))

const slug = query.pathname.split('/')[2]
const sentence = new Controller(slug)

const getInitialData = async () => {
  const data = await sentence.getInitialData(30)
  target.value.bookId = sentence.bookId
  return data
}

const nextData = async () => {
  const data = await sentence.getNextData(10)
  target.value.bookId = sentence.bookId
  return data
}
</script>

<template>
  <TopMenu />
  <ReaderController 
    :initialData="getInitialData" 
    :nextData="nextData" 
  />
</template>
