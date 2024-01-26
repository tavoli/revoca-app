<script setup lang="tsx">
import Controller from "~/utils/controller";
import ReaderController from "./ReaderController.vue"
import TopMenu from "./TopMenu.vue"

const query = useRequestURL()

const slug = query.pathname.split('/')[2]
const sentence = new Controller(slug)

const getInitialData = async () => {
  const data = await sentence.getInitialData(30)
  return data
}

const nextData = async () => {
  const data = await sentence.getNextData(10)
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
