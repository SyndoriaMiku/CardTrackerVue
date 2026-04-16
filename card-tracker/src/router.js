import { createRouter, createWebHashHistory } from 'vue-router'
import CardList from './components/CardList.vue'
import BulkAdd from './components/BulkAdd.vue'

const routes = [
    { path: '/', component: CardList, props: { type: 'recent' } },
    { path: '/ready', component: CardList, props: { type: 'ready' } },
    { path: '/lent', component: CardList, props: { type: 'lent' } },
    { path: '/bulk', component: BulkAdd } // Route mới
]

const router = createRouter({
    history: createWebHashHistory('/tracker/'), // Subfolder
    routes,
})

export default router