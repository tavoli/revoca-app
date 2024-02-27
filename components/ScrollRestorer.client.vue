<script setup lang="tsx">
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const onScroll = debounce(async () => {
  const slug = useSlug();
  const generated = findGeneratedParagraphs();
  const heights = calculateHeights(generated);
  const genHeight = sum(heights);
  const scrollY = window.scrollY;
  const y = scrollY - genHeight;

  if (y && slug) {
    postScrollPosition(slug, y);
  }
}, 1500);

const findGeneratedParagraphs = () => {
  const content = document.getElementById('content');
  const paragraphs = content?.querySelectorAll('p');
  if (!paragraphs) return [];
  const generated = Array.from(paragraphs).filter((p) => p.classList.contains('GENERATED'));
  return generated;
};

const calculateHeights = (generated: Element[]) => {
  const heights = generated.map((p) => p.getBoundingClientRect().height);
  return heights;
};

const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

window.addEventListener('scroll', onScroll);

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

onMounted(async () => {
  const slug = useSlug();
  const y = await fetchScrollPosition(slug);
  window.scrollTo(0, y);
});
</script>
