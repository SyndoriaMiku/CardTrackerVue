<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../api'

const props = defineProps({ type: String })

const cards = ref([])
const loading = ref(false)
const searchQuery = ref('')
const page = ref(1)
const isAdmin = ref(false)

const isModalOpen = ref(false)
const editingCard = ref(null)
const isAddModalOpen = ref(false)
const submittingAdd = ref(false)
const addError = ref('')

const createEmptyCard = () => ({
  name: '',
  code: '',
  rarity: 'Common',
  quantity: 1,
  isLentOut: false,
  note: ''
})

const newCard = ref(createEmptyCard())

let debounceTimeout = null

const checkAdminStatus = () => {
  const token = localStorage.getItem('access')
  if (!token) return
  
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload)
    isAdmin.value = payload.is_staff === true || payload.is_admin === true || payload.role === 'Admin'
  } catch (e) {
    console.error("Không thể decode token:", e)
    isAdmin.value = false
  }
}

const getPageSize = () => window.innerWidth < 768 ? 20 : 50

const fetchCards = async (isLoadMore = false) => {
  loading.value = true
  try {
    const limit = getPageSize()
    const res = await api.getCards(props.type, page.value, limit, searchQuery.value)
    const incomingData = res.data.data || []
    
    if (isLoadMore) cards.value.push(...incomingData)
    else cards.value = incomingData
  } catch (e) {
    console.error("Lỗi API:", e)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimeout)
  if (newVal.length >= 3 || newVal.length === 0) {
    debounceTimeout = setTimeout(() => {
      page.value = 1
      fetchCards(false)
    }, 400)
  }
})

watch(() => props.type, () => {
  page.value = 1
  cards.value = []
  fetchCards(false)
})

const openEditModal = (card) => {
  editingCard.value = { ...card } 
  isModalOpen.value = true
}

const openAddModal = () => {
  addError.value = ''
  newCard.value = createEmptyCard()
  isAddModalOpen.value = true
}

const submitAddCard = async () => {
  const payload = {
    name: newCard.value.name.trim(),
    code: newCard.value.code.trim().toUpperCase(),
    rarity: (newCard.value.rarity || 'Common').trim(),
    quantity: Math.max(0, Number(newCard.value.quantity) || 0),
    isLentOut: !!newCard.value.isLentOut,
    Note: newCard.value.note?.trim() || null
  }

  if (!payload.name || !payload.code) {
    addError.value = 'Name và Code là bắt buộc.'
    return
  }

  submittingAdd.value = true
  addError.value = ''
  try {
    await api.addCard(payload)
    isAddModalOpen.value = false
    page.value = 1
    await fetchCards(false)
  } catch (e) {
    addError.value = 'Thêm card thất bại, kiểm tra lại dữ liệu hoặc backend.'
  } finally {
    submittingAdd.value = false
  }
}

const saveChanges = async () => {
  if (!editingCard.value) return
  loading.value = true
  try {
    await api.updateCard(editingCard.value.id, editingCard.value)
    const index = cards.value.findIndex(c => c.id === editingCard.value.id)
    if (index !== -1) {
      cards.value[index] = { ...editingCard.value }
    }
    isModalOpen.value = false
  } catch (e) {
    alert("Lưu thất bại, check lại Backend Hà ơi!")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkAdminStatus()
  fetchCards(false)
})
</script>

<template>
  <div class="relative pb-20">
    <div class="mb-6 sticky top-[115px] z-10 bg-slate-950/90 backdrop-blur-md py-2">
      <div v-if="isAdmin" class="mb-3 flex justify-end">
        <button
          @click="openAddModal"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Add card
        </button>
      </div>
      <div class="relative group">
        <input v-model="searchQuery" type="text" placeholder="Tìm tên hoặc mã bài..."
          class="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 px-5 pl-12 text-sm focus:border-blue-500 outline-none transition-all shadow-2xl text-slate-200" />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div v-if="loading" class="absolute right-4 top-3.5">
          <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="card in cards" :key="card.id" 
        @click="isAdmin ? openEditModal(card) : null"
        :class="isAdmin ? 'cursor-pointer active:scale-95' : ''"
        class="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all group relative overflow-hidden">
        
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1 pr-2">
            <h3 class="font-bold text-slate-100 group-hover:text-blue-400 leading-tight transition-colors">{{ card.name }}</h3>
            <p class="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{{ card.code }} • {{ card.rarity }}</p>
          </div>
          <span :class="card.isLentOut ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'"
            class="text-[9px] font-black px-2 py-1 rounded border italic uppercase shrink-0">
            {{ card.isLentOut ? 'Lent' : 'Ready' }}
          </span>
        </div>
        
        <div class="pt-4 border-t border-slate-800/50">
          <div class="flex justify-between items-center mb-1">
            <p class="text-xs text-slate-400">
              Số lượng: <span class="text-slate-200 font-bold font-mono">{{ card.quantity }}</span>
            </p>
            <div v-if="isAdmin" class="text-[9px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              CHỈNH SỬA ✎
            </div>
          </div>
          <p v-if="card.note" class="text-[11px] italic text-slate-500 truncate">
            👤 {{ card.note }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!loading && cards.length === 0" class="text-center py-20 text-slate-600 text-sm italic">
      Không tìm thấy lá bài nào...
    </div>

    <div v-if="cards.length >= getPageSize()" class="mt-8 flex justify-center">
      <button @click="page++; fetchCards(true)" :disabled="loading"
        class="px-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 text-slate-300">
        {{ loading ? 'ĐANG QUÉT...' : 'XEM THÊM' }}
      </button>
    </div>

    <div v-if="isAddModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 class="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Add card</h2>
            <p class="text-sm font-bold text-slate-100">Tạo card mới trong kho</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-slate-500 hover:text-white p-2">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Name</label>
            <input v-model.trim="newCard.name" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="VD: Blue-Eyes White Dragon" />
          </div>

          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Code</label>
            <input v-model.trim="newCard.code" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono uppercase outline-none focus:border-emerald-500 transition-all" placeholder="VD: AGOV-EN001" />
          </div>

          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Rarity</label>
            <input v-model.trim="newCard.rarity" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="VD: Common / Ultra Rare" />
          </div>

          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Quantity</label>
            <input v-model.number="newCard.quantity" min="0" type="number" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-emerald-500 transition-all" />
          </div>

          <div class="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-bold block mb-1">Is Lent Out</span>
              <span class="text-xs font-bold" :class="newCard.isLentOut ? 'text-orange-500' : 'text-emerald-500'">
                {{ newCard.isLentOut ? 'Đang cho mượn' : 'Sẵn sàng trong kho' }}
              </span>
            </div>
            <button @click="newCard.isLentOut = !newCard.isLentOut"
              class="w-14 h-7 rounded-full relative transition-colors duration-300"
              :class="newCard.isLentOut ? 'bg-orange-600' : 'bg-slate-700'">
              <span class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg"
                :class="newCard.isLentOut ? 'left-8' : 'left-1'"></span>
            </button>
          </div>

          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Note</label>
            <textarea v-model="newCard.note" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm h-24 outline-none focus:border-emerald-500 transition-all" placeholder="Ghi chú thêm cho card..."></textarea>
          </div>

          <p v-if="addError" class="text-xs font-bold text-red-400">{{ addError }}</p>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="isAddModalOpen = false" class="flex-1 py-4 bg-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Hủy</button>
          <button @click="submitAddCard" :disabled="submittingAdd" class="flex-1 py-4 bg-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            {{ submittingAdd ? 'ĐANG THÊM...' : 'Thêm card' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 class="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Chỉnh sửa lá bài</h2>
            <p class="text-sm font-bold text-slate-100">{{ editingCard.name }}</p>
          </div>
          <button @click="isModalOpen = false" class="text-slate-500 hover:text-white p-2">✕</button>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Số lượng hiện có</label>
            <div class="flex items-center gap-3">
               <button @click="editingCard.quantity > 0 ? editingCard.quantity-- : null" class="w-10 h-10 bg-slate-800 rounded-lg font-bold">-</button>
               <input v-model.number="editingCard.quantity" type="number" class="flex-1 text-center bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm font-mono outline-none focus:border-blue-500" />
               <button @click="editingCard.quantity++" class="w-10 h-10 bg-slate-800 rounded-lg font-bold">+</button>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-bold block mb-1">Trạng thái</span>
              <span class="text-xs font-bold" :class="editingCard.isLentOut ? 'text-orange-500' : 'text-emerald-500'">
                {{ editingCard.isLentOut ? 'Đã cho mượn' : 'Sẵn sàng trong kho' }}
              </span>
            </div>
            <button @click="editingCard.isLentOut = !editingCard.isLentOut" 
              class="w-14 h-7 rounded-full relative transition-colors duration-300" 
              :class="editingCard.isLentOut ? 'bg-orange-600' : 'bg-slate-700'">
              <span class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg" 
                :class="editingCard.isLentOut ? 'left-8' : 'left-1'"></span>
            </button>
          </div>

          <div>
            <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Ghi chú (Tên người mượn)</label>
            <textarea v-model="editingCard.note" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm h-24 outline-none focus:border-blue-500 transition-all" placeholder="Ghi chú người mượn hoặc vị trí để bài..."></textarea>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="isModalOpen = false" class="flex-1 py-4 bg-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Hủy</button>
          <button @click="saveChanges" :disabled="loading" class="flex-1 py-4 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            {{ loading ? 'ĐANG LƯU...' : 'Xác nhận lưu' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>