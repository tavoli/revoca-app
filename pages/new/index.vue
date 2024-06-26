<script setup lang="ts">
import { nanoid } from 'nanoid';

const router = useRouter()

const form = useState(() => ({
  title: '',
  prose: '',
  image: ''
}))

const isLoading = ref(false)

onMounted(() => {
  // just a clever way to wake up the database
  fetchPinsPaginate() // or
  fetch(`/api/ping`)
})

const onSubmit = async (e: Event) => {
  e.preventDefault();

  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const slug = slugify(form.value.title)
    const slugaid = `${slug}-${nanoid(7)}`

    const body = {
      title: form.value.title,
      ops: [
        { insert: form.value.title },
        { insert: '\n', attributes: { header: 1 } },
        { insert: form.value.prose.replace(/\n(?!\n)/g, ' ') }
      ],
      slug: slugaid,
    }

    if (form.value.image) {
      Object.assign(body, {image: form.value.image })
    }

    await postBook(body)

    const pins = await fetchPinsPaginate()

    if (pins.length) {
      router.push({
        name: 'config',
        query: {slug: slugaid}
      })
    } else {
      router.push('/books')
    }
  } catch (error) {
    console.error(error)
  }

  isLoading.value = false;
};

const handleEditor = (values: any) => {
  form.value.title = values.ops[0].insert
  const withImage: any = values.ops.find((op: any) => op?.insert.image)
  if (withImage) {
    const image = withImage.insert.image
    const type = image.url.split(';')[0].split('/')[1]
    const data = image.url.split(',')[1]
    form.value.image = {
      type,
      data
    }
  }
}
</script>

<template>
  <main class="w-7/12 mx-auto min-h-screen">
    <header class="flex items-center justify-between w-full py-4">
      <label class="text-md text-center text-gray-400" for="raw">
         you are storing a new book
      </label>
      <div class="flex-1 flex items-center justify-end">
        <button 
          class="bg-blue-950 text-white font-bold py-2 px-4 rounded" 
          type="submit" 
          :disabled="isLoading"
          :class="{ 'bg-gray-500 cursor-not-allowed': isLoading }"
          @click="onSubmit">
          next
          <span v-if="isLoading" class="animate-pulse ml-2">⏳</span>
        </button>
      </div>
    </header>
    <div id="editor" class="w-10/12 mt-8 mx-auto font-bookerly prose text-slate-300">
      <h1 class="text-2xl font-bold text-center">
        write the title of the book 
      </h1>
      <img
        class="w-10/12 mx-auto my-4 cursor-pointer"
        src="https://via.placeholder.com/150" 
        alt="book cover" 
      />
    </div>
    <ClientOnly>
      <div class="w-10/12 mx-auto prose">
        <textarea v-model="form.prose" 
            class="w-full bg-transparent text-slate-300 font-bookerly border-none outline-none" 
            placeholder="write your story..." 
            oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';">
        </textarea>
      </div>
      <Editor @change="handleEditor" />
    </ClientOnly>
  </main>
</template>

<style scoped>
  textarea {
    resize: none;
    overflow: hidden;
    min-height: 200px;
  }
</style>
