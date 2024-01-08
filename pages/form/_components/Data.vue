 <script setup lang="ts">
  import type { Form } from '../index.vue';

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
    <div>
      <label for="title">title</label>
      <input 
        id="title" 
        name="title" 
        v-model="form.title"
        type="text" 
      />
    </div>
    <div>
      <label for="drag">drag a file</label>
      <input 
        id="drag" 
        name="file" 
        @input="onFileChange"
        type="file" 
      />
    </div>
    <h1>or</h1>
    <div>
      <label for="raw">insert a text</label>
      <textarea 
        id="raw" 
        v-model="form.rawText"
        cols="30" 
        rows="10">
      </textarea>
    </div>
    <div>
      <label for="image">image</label>
      <input 
        id="image" 
        v-model="form.imageUrl"
        type="text" 
      />
    </div>
    <div class="errors">
      <label class="error" for="raw">
        {{form.errors.get('rawText')}}
      </label>
      <label class="error" for="image">
        {{form.errors.get('imageUrl')}}
      </label>
    </div>
    <button type="submit" @click="onSubmit">
      submit
    </button>
  </form>
</template>

<style scoped>
  form {
    margin: 0 auto;
    width: 300px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  label {
    color: #fff;
    font-size: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 10px;
  
    input {
      border-bottom: 1px solid #fff;
    }
  }

  .errors {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .error {
    color: red;
    font-size: 12px;
  }
</style>