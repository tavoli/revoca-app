<script lang="tsx" setup>
const router = useRouter()

const gotoHome = () => {
  router.push('/')
}
</script>

<template>
  <button @click="gotoHome" class="btn btn-primary w-24">
    home
  </button>
</template>
