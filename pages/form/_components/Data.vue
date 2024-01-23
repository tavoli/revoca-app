 <script setup lang="tsx">
  import type {Form} from '../index.vue';

  const step = useState("step")
  const sentences = useState("sentences")
  const form = useState<Form>("form")

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      form.value.rawText = result;
    };
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!form.value.rawText) {
      form.value.errors.set('title', 'title is required');
    }
    if (!form.value.rawText) {
      form.value.errors.set('rawText', 'raw text is required');
    }
    if (!form.value.imageUrl) {
      form.value.errors.set('imageUrl', 'image url is required');
    }
    if (form.value.errors.size) return;
    sentences.value = form.value.rawText.split('\n');
    step.value = 2;
  };
</script>

 <template>
  <main class="w-7/12 mx-auto">
    <header class="flex items-center justify-between w-full py-4">
      <label class="text-md text-center" for="raw">
         you are storing a new book
      </label>
      <div class="flex-1 flex items-center justify-end">
        <button 
          class="bg-blue-500 text-white font-bold py-2 px-4 rounded" 
          type="submit" 
          @click="onSubmit">
          next
        </button>
      </div>
    </header>
    <form class="w-10/12 mt-8 mx-auto">
      <Editor v-model="form.rawText" />
    </form>
  </main>
</template>
