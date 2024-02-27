<script setup lang="ts">
import type {Blot} from 'parchment';
import Quill from 'quill/core';

const slug = useSlug()
const DATA_KEY = factoryDataKeys(slug)

const fetchPinsOrCache = async () => {
  const cache = useNuxtData(DATA_KEY.PINS);
  if (!cache.data.value) {
    const data = await fetchPinsPaginate();
    cache.data.value = data;
  }
  return cache.data.value.map((pin: any) => pin.pin);
};

const fetchPinnedOrCache = async () => {
  const cache = useNuxtData(DATA_KEY.PINNED)
  if (!cache.data.value) {
    const data = await fetchPinned(slug)
    cache.data.value = data
  }
  return cache.data.value
}

const pins = await fetchPinsOrCache()
const pinned = await fetchPinnedOrCache()

const content = document.querySelector('#content')
if (!content) throw new Error('Content not found')

const paragraphs = content.querySelectorAll('p')

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0,
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const p = entry.target as HTMLParagraphElement;
    const node = Quill.find(p);

    if (!node) return;

    const index = window.quill.getIndex(node as Blot);
    const [line] = window.quill.getLine(index);

    if(!line) return;

    const contents = line.delta();

    if (contents) {
      highlight(contents, index, pins, pinned);
    }
  });
}, options);

paragraphs.forEach((p) => observer.observe(p))

onUnmounted(() => {
  observer.disconnect()
})
</script>
