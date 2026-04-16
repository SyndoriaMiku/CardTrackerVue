<script setup>
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const rawJson = ref('')
const loading = ref(false)
const error = ref('')

const handleBulkAdd = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = JSON.parse(rawJson.value) // Parse thử xem JSON có lỗi cú pháp không
    
    await api.addBulkCards(Array.isArray(data) ? data : [data])
    
    alert("Vít card thành công!")
    router.push('/') // Quay về trang chủ xem thành quả
  } catch (e) {
    error.value = "JSON lỗi rồi Hà ơi, check lại dấu phẩy/ngoặc nhé!"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
    <h2 class="text-xl font-bold mb-4 text-blue-400">Nhập bài hàng loạt (Bulk Add)</h2>
    <p class="text-xs text-slate-500 mb-4 italic">Dán mảng JSON từ Postman hoặc Excel vào đây để hệ thống tự Group & Upsert.</p>
    
    <textarea 
      v-model="rawJson"
      placeholder='[{"name": "Blue-Eyes...", "quantity": 3}, ...]'
      class="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-500 outline-none focus:border-blue-500 transition-all"
    ></textarea>

    <div v-if="error" class="mt-2 text-red-500 text-xs font-bold">{{ error }}</div>

    <button 
      @click="handleBulkAdd"
      :disabled="loading || !rawJson"
      class="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
    >
      {{ loading ? 'ĐANG VÍT...' : 'XÁC NHẬN NHẬP KHO' }}
    </button>
  </div>
</template>