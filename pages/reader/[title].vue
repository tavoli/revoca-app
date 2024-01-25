<script setup lang="tsx">
import Controller from "~/utils/controller";
import List from "./List.vue"

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
  <List :initialData="getInitialData" :nextData="nextData" />
</template>
