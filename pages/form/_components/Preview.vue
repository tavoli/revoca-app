<script setup lang="tsx">
  import { nanoid } from 'nanoid';
  import type { Form } from '../index.vue';

  const router = useRouter()

  const form = useState<Form>("form")
  const sentences = useState("sentences", () => []) 

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') 
      .replace(/[^\w\-]+/g, '') 
      .replace(/\-\-+/g, '-') 
      .replace(/^-+/, '') 
      .replace(/-+$/, '');
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();

    const slug = slugify(form.value.title)
    const slugaid = `${slug}-${nanoid(7)}`

    $fetch('/api/books', {
      method: 'POST',
      body: { 
        title: form.value.title,
        imageUrl: form.value.imageUrl,
        sentences: sentences.value,
        slug: slugaid,
      },
    })

    $fetch('/api/books', {
      method: 'POST',
      body: { 
        title: form.value.title,
        imageUrl: form.value.imageUrl,
        sentences: sentences.value,
        slug: `${slugaid}-${nanoid(7)}`,
        pins: { ids: [1, 2, 3] }
      },
    })

    router.push(['/reader', slugaid].join('/'))
  };
</script>

<template>
  <form :v-on-submit="onSubmit">
    <h1>step 2</h1>
    <div class="flex flex-col items-start justify-start space-y-2">
      <label for="title">title</label>
      <input 
        id="title" 
        name="title" 
        v-model="form.title"
        type="text" 
      />
    </div>
    <div class="flex flex-col items-start justify-start space-y-2">
      <label class="text-2xl font-bold mb-4" for="image">image url</label>
      <input 
        id="image" 
        class="border border-gray-400 rounded p-2 w-full"
        v-model="form.imageUrl"
        type="text" 
      />
    </div>
    <ul>
      <li v-for="(_, index) in sentences" :key="index">
        <input type="text" v-model="sentences[index]">
      </li>
    </ul>
    <button type="submit" @click="onSubmit">
      submit
    </button>
  </form>
</template>
