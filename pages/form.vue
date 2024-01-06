<template>
  <form :v-on-submit="onSubmit" v-if="step === 1">
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
        v-model="rawText"
        cols="30" 
        rows="10">
      </textarea>
    </div>
    <div>
      <label for="image">image</label>
      <input 
        id="image" 
        v-model="imageUrl"
        type="text" 
      />
    </div>
    <div class="errors">
      <label class="error" for="raw">
        {{errors.get('rawText')}}
      </label>
      <label class="error" for="image">
        {{errors.get('imageUrl')}}
      </label>
    </div>
    <button type="submit" @click="onSubmit">
      submit
    </button>
  </form>
  <form v-else :v-on-submit="onSubmit2">
    <h1>step 2</h1>
    <ul>
      <li v-for="(_, index) in sentences" :key="index">
        <input type="text" v-model="sentences[index]">
      </li>
    </ul>
    <button type="submit" @click="onSubmit2">
      submit
    </button>
  </form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  const step = ref(1);
  const rawText = ref('put your text here');
  const imageUrl = ref('put your image url here');
  const sentences = ref<string[]>([]);
  const errors = ref<Map<string, string>>(new Map());

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      rawText.value = result;
    };
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();

    errors.value.clear();

    if (!rawText.value) {
      errors.value.set('rawText', 'text is required');
    }
    if (!imageUrl.value) {
      errors.value.set('imageUrl', 'image url is required');
    }

    if (errors.value.size > 0) return;

    sentences.value = rawText.value.split('\n');
    step.value = 2;
  };

  const onSubmit2 = (e: Event) => {
    e.preventDefault();
    console.log(sentences.value);
  };
</script>

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