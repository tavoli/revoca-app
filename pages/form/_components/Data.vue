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
  <form :v-on-submit="onSubmit">
    <section class="book-sentences">
      <div class="control">
        <label for="drag">drag a file</label>
        <input 
          id="drag" 
          name="file" 
          @input="onFileChange"
          type="file" 
        />
      </div>
      <h1>or</h1>
      <div class="control textarea">
        <label for="raw">insert a text</label>
        <textarea 
          id="raw" 
          v-model="form.rawText">
        </textarea>
      </div>
    </section>
    <section class="book-props">
      <div class="control">
        <label for="title">title</label>
        <input 
          id="title" 
          name="title" 
          v-model="form.title"
          type="text" 
        />
      </div>
      <div class="control">
        <label for="image">image</label>
        <input 
          id="image" 
          v-model="form.imageUrl"
          type="text" 
        />
      </div>
      <button type="submit" @click="onSubmit" class="btn btn-primary">
        submit
      </button>
    </section>
  </form>
</template>

<style lang="postcss" scoped>
 form {
   @apply flex items-center justify-around;
   @apply w-full;
 }

 section {
   @apply flex flex-col items-start justify-start;
   @apply space-y-4 h-full p-4;
 }

 .book-sentences {
    @apply w-1/2 h-screen;
  }

 .book-props {
    @apply w-1/3;
    margin-bottom: auto;
  }

 .control {
   @apply flex flex-col items-start justify-start w-full;
   @apply space-y-2;
 }

 .control.textarea {
   flex: 1;
 }

 label {
   @apply text-2xl font-bold mb-4;
 }

 input, textarea {
   @apply border border-gray-400 rounded p-2 w-full;
 }

 textarea {
   @apply flex-grow;
 }

 .btn {
   @apply bg-blue-500 text-white font-bold py-2 px-4 rounded;
 }
</style>
