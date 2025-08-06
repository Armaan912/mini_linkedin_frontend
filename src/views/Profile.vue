<template>
  <div class="profile-container">
    <Header :user="currentUser" @logout="logout" />
    <div class="container-fluid px-3 mt-3">
      <div class="row g-3">
        <div class="col-12 d-lg-none">
          <div class="mobile-profile-card">
            <div class="d-flex align-items-center mb-3">
              <img 
                :src="getImageUrl(profileUser?.profileImage) || '/default-avatar.png'" 
                alt="Profile" 
                class="mobile-profile-image me-3"
              />
              <div class="flex-grow-1">
                <h4 class="mb-1">{{ profileUser?.name }}</h4>
                <p class="text-muted mb-1 small">{{ profileUser?.bio || 'No bio yet' }}</p>
                <p class="text-muted mb-0 small">
                  <i class="fas fa-envelope"></i> {{ profileUser?.email }}
                </p>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button 
                v-if="isOwnProfile" 
                @click="showEditProfile = true" 
                class="btn btn-primary btn-sm flex-grow-1"
              >
                <i class="fas fa-edit"></i> Edit Profile
              </button>
              <button @click="$router.push('/home')" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-home"></i>
              </button>
              <button @click="$router.push('/my-posts')" class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-list"></i>
              </button>
              <button @click="$router.push('/users')" class="btn btn-outline-info btn-sm">
                <i class="fas fa-users"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-3 d-none d-lg-block">
          <div class="sidebar-card">
            <div class="profile-section">
              <img 
                :src="getImageUrl(profileUser?.profileImage) || '/default-avatar.png'" 
                alt="Profile" 
                class="large-profile-image"
              />
              <h4>{{ profileUser?.name }}</h4>
              <p class="text-muted">{{ profileUser?.bio || 'No bio yet' }}</p>
              <p class="text-muted">
                <i class="fas fa-envelope"></i> {{ profileUser?.email }}
              </p>
              
              <button 
                v-if="isOwnProfile" 
                @click="showEditProfile = true" 
                class="btn btn-primary btn-sm w-100 mb-2"
              >
                <i class="fas fa-edit"></i> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="posts-container">
            <div class="posts-header">
              <h5 class="mb-0">
                <i class="fas fa-list"></i> Posts by {{ profileUser?.name }}
              </h5>
            </div>
            
            <div class="posts-scroll-area">
              <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div v-else-if="posts.length === 0" class="text-center">
                <p class="text-muted">No posts yet.</p>
              </div>

              <div v-else>
                <PostCard 
                  v-for="post in posts" 
                  :key="post._id" 
                  :post="post" 
                  @like="toggleLike"
                  @comment="addComment"
                  @delete-comment="deleteComment"
                  @edit-comment="editComment"
                  @refresh="refreshPosts"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 d-none d-lg-block">
          <div class="sidebar-card">
            <h6>Quick Actions</h6>
            <div class="d-grid gap-2">
              <button @click="$router.push('/home')" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-home"></i> Home
              </button>
              <button @click="$router.push('/my-posts')" class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-list"></i> My Posts
              </button>
              <button @click="$router.push('/users')" class="btn btn-outline-info btn-sm">
                <i class="fas fa-users"></i> Browse Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditProfile" class="modal-overlay" @click="showEditProfile = false">
      <div class="modal-content" @click.stop>
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Edit Profile</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input 
                  v-model="editForm.name" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Bio</label>
                <textarea 
                  v-model="editForm.bio" 
                  class="form-control" 
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Profile Image</label>
                <input 
                  type="file" 
                  @change="handleImageUpload" 
                  accept="image/*" 
                  class="form-control"
                />
              </div>
              <div class="d-flex justify-content-between">
                <button type="button" @click="showEditProfile = false" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../store/authStore.js';
import { useRouter, useRoute } from 'vue-router';
import PostCard from '../components/PostCard.vue';
import axios from '../lib/api/axios.js';
import Swal from 'sweetalert2';
import Header from '../components/Header.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const currentUser = auth.user;
const profileUser = ref(null);
const posts = ref([]);
const loading = ref(false);
const showEditProfile = ref(false);
const showUserDropdown = ref(false);
const editForm = ref({
  name: '',
  bio: '',
  image: null
});

const isOwnProfile = computed(() => {
  return currentUser?._id === profileUser.value?._id;
});

onMounted(async () => {
  if (!currentUser) {
    router.push('/login');
    return;
  }
  
  const userId = route.params.id || currentUser._id;
  await loadProfile(userId);
  await loadPosts(userId);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showUserDropdown.value = false;
  }
};

const loadProfile = async (userId) => {
  try {
    profileUser.value = await getUserProfile(userId);
    if (isOwnProfile.value) {
      editForm.value.name = profileUser.value.name;
      editForm.value.bio = profileUser.value.bio;
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load profile',
      confirmButtonColor: '#dc3545',
    });
  }
};

const loadPosts = async (userId) => {
  loading.value = true;
  try {
    if (isOwnProfile.value) {
      posts.value = await getMyPosts();
    } else {
      posts.value = await getUserPosts(userId);
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load posts',
      confirmButtonColor: '#dc3545',
    });
  } finally {
    loading.value = false;
  }
};

const handleImageUpload = (event) => {
  editForm.value.image = event.target.files[0];
};

const updateProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('name', editForm.value.name);
    formData.append('bio', editForm.value.bio);
    if (editForm.value.image) {
      formData.append('profileImage', editForm.value.image);
    }
    
    await updateUserProfile(formData);
    await loadProfile(currentUser._id);
    showEditProfile.value = false;
    
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your profile has been updated successfully.',
      confirmButtonColor: '#0d6efd',
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to update profile',
      confirmButtonColor: '#dc3545',
    });
  }
};

const toggleLike = async (postId) => {};

const addComment = async (postId, comment) => {};

const deleteComment = async (postId, commentId) => {};

const editComment = async (postId, commentId, text) => {};

const refreshPosts = async () => {
  await loadPosts(route.params.id || currentUser._id);
};

const logout = () => {
  auth.logout();
  router.push('/login');
};

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value;
};

const closeUserDropdown = () => {
  showUserDropdown.value = false;
};

const navigateAndClose = (path) => {
  showUserDropdown.value = false;
  router.push(path);
};

const logoutAndClose = () => {
  showUserDropdown.value = false;
  logout();
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `http://localhost:5000/${imagePath}`;
};

const getMyPosts = async () => {
  const res = await axios.get('/posts/me');
  return res.data;
};

const getUserPosts = async (userId) => {
  const res = await axios.get(`/posts/user/${userId}`);
  return res.data;
};

const getUserProfile = async (userId) => {
  const res = await axios.get(`/users/${userId}`);
  return res.data;
};

const updateUserProfile = async (formData) => {
  const res = await axios.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f3f2ef;
}

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

.large-profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.mobile-profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-profile-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .user-name {
    font-size: 1rem;
  }
}

.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (min-width: 992px) {
  .sidebar-card {
    padding: 1.5rem;
  }
}

.profile-section {
  text-align: center;
}

.posts-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.posts-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.posts-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px 8px 0 0;
}

.posts-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-right: 8px;
}

.posts-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.posts-scroll-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.posts-scroll-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.posts-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 991px) {
  .posts-container {
    height: calc(100vh - 100px);
  }
}

@media (min-width: 576px) {
  .posts-section {
    padding: 1.5rem;
  }
  
  .posts-header {
    padding: 1.5rem;
  }
  
  .posts-scroll-area {
    padding: 1.5rem;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 95%;
  max-width: 500px;
  margin: 0 auto;
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

@media (min-width: 576px) {
  .modal-content {
    width: 90%;
  }
}
</style> 