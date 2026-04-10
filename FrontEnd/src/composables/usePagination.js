import { ref, computed } from 'vue'

export function usePagination(pageSize = 10) {
  const currentPage = ref(1)
  const size = ref(pageSize)

  function paginate(list) {
    const start = (currentPage.value - 1) * size.value
    return list.slice(start, start + size.value)
  }

  function reset() {
    currentPage.value = 1
  }

  return { currentPage, size, paginate, reset }
}
