<script setup lang="tsx">
import { nanoid } from 'nanoid';

const router = useRouter()

const form = useState("form", () => ({
  title: '',
  rawText: '',
  imageSrc: '',
  sentences: [],
  errors: new Map<string, string>(),
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
      imageSrc: form.value.imageSrc,
      sentences: form.value.sentences.slice(),
      slug: slugaid,
    }

    await postBook(body)

    router.push({ name: 'config', query: { slug: slugaid } })
  } catch (error) {
    console.error(error)
  }

  isLoading.value = false;
};

const handleEditor = (values: any) => {
  if (!values) return;
  console.log(values)
  form.value.title = values.content?.[0].content?.[0].text
  form.value.imageSrc = values.content?.[1]?.attrs?.src
  const startParagraph = values.content.findIndex(
    (sentence: any) => sentence.type === "paragraph"
  )
  form.value.sentences = values.content
    .slice(startParagraph)
    .map((value: any) => value.content?.[0].text)
    .filter(Boolean)
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
    <form class="w-10/12 mt-8 mx-auto">
     <Editor v-on:change="handleEditor" />
    </form>
  </main>
</template>
