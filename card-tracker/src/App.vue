<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)
const isAdmin = ref(false)

const checkAuth = () => {
  const token = localStorage.getItem('access');
  const isStaff = localStorage.getItem('is_admin');
  
  if (token) {
    try {
      // Decode payload để lấy username hiển thị
      const payload = JSON.parse(atob(token.split('.')[1]));
      user.value = payload;
      isAdmin.value = isStaff === 'true';
    } catch (e) {
      console.error("Token không hợp lệ");
    }
  }
}

const logout = () => {
  localStorage.clear();
  window.location.reload();
}

onMounted(checkAuth)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans">
    <header class="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
      <h1 class="text-xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
        TRACKER <span class="text-[10px] font-mono text-slate-500 ml-1"></span>
      </h1>
      
      <div v-if="user" class="flex items-center gap-3">
        <div class="text-right hidden xs:block">
          <p class="text-xs font-bold">{{ user.username || 'User' }}</p>
          <p class="text-[9px] text-emerald-500 font-mono" v-if="isAdmin">ADMIN ACCESS</p>
        </div>
        <button @click="logout" class="bg-slate-800 p-2 rounded-full hover:bg-red-500/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <nav class="flex p-1 bg-slate-900 border-b border-slate-800 sticky top-[65px] z-20">
      <router-link to="/" class="nav-link" active-class="active">Gần đây</router-link>
      <router-link to="/ready" class="nav-link" active-class="active">Kho sẵn</router-link>
      <router-link to="/lent" class="nav-link" active-class="active">Đang mượn</router-link>
      <router-link to="/bulk" class="nav-link text-emerald-500" active-class="active">
        <span class="text-lg">+</span>
      </router-link>
    </nav>

    <main class="p-4 max-w-5xl mx-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
@reference "./style.css";
.nav-link {
  @apply flex-1 py-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all;
}
.active {
  @apply text-blue-400 bg-slate-800/50 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)];
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>