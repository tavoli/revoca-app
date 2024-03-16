<script setup lang="tsx">
import { nanoid } from 'nanoid';

const router = useRouter()

const form = useState(() => ({
  title: '',
  ops: [],
}))

const isLoading = ref(false)

const onSubmit = async (e: Event) => {
  e.preventDefault();

  if (isLoading.value) return;

  isLoading.value = true;

  try {
    const slug = slugify(form.value.title)
    const slugaid = `${slug}-${nanoid(7)}`

    const body = {
      title: form.value.title,
      ops: form.value.ops,
      slug: slugaid,
    }

    const withImage: any = form.value.ops.find((op: any) => op?.insert.image)

    if (withImage) {
      const imageBase = withImage.insert.image
      const type = imageBase?.url.split(';')[0].split('/')[1]
      const data = imageBase?.url.split(',')[1]

      Object.assign(body, {
        ops: form.value.ops.filter((op: any) => !op.insert?.image),
        image: {
          type,
          data
        },
      })
    }

    postBook(body)

    router.push({
      name: 'config',
      query: {slug: slugaid}
    })
  } catch (error) {
    console.error(error)
  }

  isLoading.value = false;
};

const handleEditor = (values: any) => {
  form.value.ops = values.ops
  form.value.title = values.ops[0].insert
}
</script>

<template>
  <Body class="mode-dark" />
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
      <p>
        write your story...
      </p>
    </div>
    <ClientOnly>
      <Editor @change="handleEditor" />
    </ClientOnly>
  </main>
</template>
