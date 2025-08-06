<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Register</h3>

        <form @submit.prevent="handleSubmit" novalidate>
          <BaseInput
            v-model="form.name"
            name="name"
            label="Full Name"
            :error="v$.name.$error && v$.name.$dirty ? 'Name is required' : ''"
          />

          <BaseInput
            v-model="form.email"
            name="email"
            label="Email"
            :error="v$.email.$error && v$.email.$dirty
              ? (v$.email.email.$invalid ? 'Must be a valid email' : 'Email is required')
              : ''"
          />

          <BaseInput
            v-model="form.password"
            name="password"
            label="Password"
            type="password"
            :error="v$.password.$error && v$.password.$dirty ? 'Password is required' : ''"
          />

          <BaseTextarea
            v-model="form.bio"
            name="bio"
            label="Short Bio"
            placeholder="Tell us something about yourself"
          />

          <button 
            class="btn btn-primary w-100 mt-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
          <div class="mt-3 text-center">
            <router-link to="/login">Already have an account? Login</router-link>
          </div>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f3f2ef;
}

.auth-card {
  width: 100%;
  max-width: 500px;
}

.card-body {
  padding: 2rem;
}

@media (max-width: 575px) {
  .auth-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
}
</style>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import BaseInput from '../components/BaseInput.vue';
import BaseTextarea from '../components/BaseTextarea.vue';
import { useAuthStore } from '../store/authStore.js';
import Swal from 'sweetalert2';

const router = useRouter();
const auth = useAuthStore();
const isLoading = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: '',
  bio: '',
});

const rules = {
  name: { required },
  email: { required, email },
  password: { required },
};

const v$ = useVuelidate(rules, form);

const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  isLoading.value = true;

  try {
    await auth.registerOnly(form);
    await Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      text: 'Your account has been created successfully. Please login to continue.',
      confirmButtonText: 'Go to Login',
      confirmButtonColor: '#0d6efd',
    });
    router.push('/login');
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: err.response?.data?.message || err.message,
      confirmButtonColor: '#dc3545',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
