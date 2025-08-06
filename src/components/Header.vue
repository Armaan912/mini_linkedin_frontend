<template>
  <header class="header">
    <div class="container-fluid px-3">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="mb-0 responsive-title">
          <i :class="iconClass"></i>
          <span class="d-none d-sm-inline">{{ title }}</span>
          <span class="d-inline d-sm-none">{{ shortTitle }}</span>
        </h1>
        <div class="d-flex align-items-center gap-2">
          <slot name="actions"></slot>
          <div class="user-dropdown">
            <button class="btn user-dropdown-btn p-1" type="button" @click="toggleUserDropdown">
              <img 
                :src="getImageUrl(user?.profileImage) || '/default-avatar.png'" 
                alt="Profile" 
                class="profile-image"
              />
              <span class="user-name d-none d-md-inline ms-2">{{ user?.name }}</span>
            </button>
            <div v-if="showUserDropdown" class="user-dropdown-menu">
              <div class="user-dropdown-header">
                <img 
                  :src="getImageUrl(user?.profileImage) || '/default-avatar.png'" 
                  alt="Profile" 
                  class="dropdown-profile-image"
                />
                <span class="dropdown-user-name">{{ user?.name }}</span>
              </div>
              <div class="user-dropdown-divider"></div>
              <button class="user-dropdown-item" @click="navigateAndClose('/home')">
                <i class="fas fa-home"></i> Home
              </button>
              <button class="user-dropdown-item" @click="navigateAndClose('/profile')">
                <i class="fas fa-user"></i> My Profile
              </button>
              <button class="user-dropdown-item" @click="navigateAndClose('/my-posts')">
                <i class="fas fa-list"></i> My Posts
              </button>
              <button class="user-dropdown-item" @click="navigateAndClose('/users')">
                <i class="fas fa-users"></i> Browse Users
              </button>
              <div class="user-dropdown-divider"></div>
              <button class="user-dropdown-item text-danger" @click="logoutAndClose">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  user: Object,
  title: {
    type: String,
    default: 'Mini LinkedIn'
  },
  shortTitle: {
    type: String,
    default: 'ML'
  },
  iconClass: {
    type: String,
    default: 'fab fa-linkedin text-primary'
  }
});

const emit = defineEmits(['logout']);
const router = useRouter();
const showUserDropdown = ref(false);

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value;
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showUserDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const navigateAndClose = (path) => {
  showUserDropdown.value = false;
  router.push(path);
};

const logoutAndClose = () => {
  showUserDropdown.value = false;
  emit('logout');
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `http://localhost:5000/${imagePath}`;
};
</script>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1020;
}
.responsive-title {
  font-size: clamp(1.2rem, 4vw, 1.75rem);
}
.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
@media (min-width: 768px) {
  .profile-image {
    width: 40px;
    height: 40px;
  }
}
.user-dropdown {
  position: relative;
}
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1050;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.user-dropdown-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}
.dropdown-profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.dropdown-user-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}
.user-dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  color: #333;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.user-dropdown-item:hover {
  background-color: #f8f9fa;
}
.user-dropdown-item.text-danger {
  color: #dc3545;
}
.user-dropdown-item.text-danger:hover {
  background-color: #fff5f5;
}
.user-dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 0;
}
.user-dropdown-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: none;
  outline: none;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
.user-dropdown-btn:focus {
  outline: none;
  box-shadow: none;
}
.user-name {
  font-size: 0.875rem;
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}
@media (min-width: 768px) {
  .user-name {
    font-size: 1rem;
  }
}
</style>