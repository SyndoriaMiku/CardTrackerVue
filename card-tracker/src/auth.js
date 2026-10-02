import { ref, computed } from 'vue'

const STORAGE_KEY = 'card_api_key'

export const apiKey = ref(localStorage.getItem(STORAGE_KEY) || '')
export const isAdmin = computed(() => !!apiKey.value)

export const setApiKey = (key) => {
  apiKey.value = key.trim()
  localStorage.setItem(STORAGE_KEY, apiKey.value)
}

export const clearApiKey = () => {
  apiKey.value = ''
  localStorage.removeItem(STORAGE_KEY)
}
