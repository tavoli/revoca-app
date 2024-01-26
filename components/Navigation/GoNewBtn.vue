<script lang="tsx" setup>
const router = useRouter()

const gotoNew = () => {
  router.push('/new')
}
</script>

<template>
  <button @click="gotoNew" class="btn btn-secondary w-24">
    new
  </button>
</template>
