<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-4">
      <a class="navbar-brand" href="#">MiniLinkedIn</a>
      <div class="ms-auto">
        <button class="btn btn-outline-danger" @click="logout">Logout</button>
      </div>
    </nav>
    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  localStorage.removeItem('token')
  authStore.logout()
  router.push('/login')
}
</script>