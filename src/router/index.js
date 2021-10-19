import Vue from 'vue'
import VueRouter from 'vue-router'
import AutoTable from '../components/AutoTable'

Vue.use(VueRouter)

const routes = [
  {
    path: '/panel',
    name: 'Bac à état',
    component: AutoTable,
  },
]

const router = new VueRouter({
  routes
})

export default router
