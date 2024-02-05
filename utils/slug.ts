export function useSlug() {
  const route = useRoute()
  const slug = route.params.slug
  return slug as string
}
