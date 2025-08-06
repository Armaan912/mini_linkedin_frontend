<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './store/authStore.js';

const auth = useAuthStore();

onMounted(async () => {
  await auth.loadUser();
});
</script>

<template>
   <RouterView />
</template>


