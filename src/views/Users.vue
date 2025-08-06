<template>
	<div class="users-container">
		<Header
			:user="user"
			title="Browse Users"
			shortTitle="Users"
			iconClass="fas fa-users text-primary"
			@logout="logout"
		/>
		<div class="container-fluid px-3 mt-3">
			<div class="row g-3">
				<div class="col-12 col-lg-8 mx-auto">
					<div class="search-section mb-4">
						<div class="input-group">
							<span class="input-group-text">
								<i class="fas fa-search"></i>
							</span>
							<input
								v-model="searchQuery"
								type="text"
								class="form-control"
								placeholder="Search users by name..."
							/>
						</div>
					</div>

					<div v-if="loading" class="text-center">
						<div class="spinner-border" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>

					<div v-else-if="filteredUsers.length === 0" class="text-center">
						<p class="text-muted">
							{{
								searchQuery
									? "No users found matching your search."
									: "No users available."
							}}
						</p>
					</div>

					<div v-else class="users-grid">
						<div
							v-for="user in filteredUsers"
							:key="user._id"
							class="user-card"
							@click="viewUserProfile(user._id)"
						>
							<div class="card h-100 user-card-inner">
								<div class="card-body text-center">
									<img
										:src="
											getImageUrl(user.profileImage) || '/default-avatar.png'
										"
										alt="Profile"
										class="user-avatar"
									/>
									<h6 class="card-title mt-3 mb-1">{{ user.name }}</h6>
									<p class="card-text text-muted small">
										{{ user.bio || "No bio available" }}
									</p>
									<button class="btn btn-outline-primary btn-sm mt-2">
										<i class="fas fa-eye"></i> View Profile
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "vue-router";
import axios from "../lib/api/axios.js";
import Header from "../components/Header.vue";

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;
const users = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const showUserDropdown = ref(false);

onMounted(async () => {
	if (!user) {
		router.push("/login");
		return;
	}
	await loadUsers();
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
	const dropdown = document.querySelector(".user-dropdown");
	if (dropdown && !dropdown.contains(event.target)) {
		showUserDropdown.value = false;
	}
};

const loadUsers = async () => {
	loading.value = true;
	try {
		users.value = await getAllUsers();
	} catch (error) {
		console.error("Error loading users:", error);
	} finally {
		loading.value = false;
	}
};

const getAllUsers = async () => {
	const res = await axios.get("/users");
	return res.data;
};

const filteredUsers = computed(() => {
	if (!searchQuery.value.trim()) {
		return users.value;
	}
	return users.value.filter((user) =>
		user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});

const getImageUrl = (imagePath) => {
	if (!imagePath) return "";
	if (imagePath.startsWith("http")) {
		return imagePath;
	}
	return `https://mini-linkedin-backend-ornn.onrender.com/api/${imagePath}`;
};

const viewUserProfile = (userId) => {
	router.push(`/profile/${userId}`);
};

const toggleUserDropdown = () => {
	showUserDropdown.value = !showUserDropdown.value;
};

const navigateAndClose = (path) => {
	showUserDropdown.value = false;
	router.push(path);
};

const logoutAndClose = () => {
	showUserDropdown.value = false;
	auth.logout();
	router.push("/login");
};

const logout = () => {
	auth.logout();
	router.push("/login");
};
</script>

<style scoped>
.users-container {
	min-height: 100vh;
	background-color: #f3f2ef;
}

.header {
	background: white;
	border-bottom: 1px solid #e0e0e0;
	padding: 0.75rem 0;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.user-name {
	font-size: 0.875rem;
}

@media (min-width: 768px) {
	.user-name {
		font-size: 1rem;
	}
}

.search-section {
	background: white;
	border-radius: 8px;
	padding: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
}

.user-card {
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-card-inner {
	border: none;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.user-avatar {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	object-fit: cover;
	border: 3px solid #e0e0e0;
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

@media (max-width: 767px) {
	.container-fluid {
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.users-grid {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.user-avatar {
		width: 60px;
		height: 60px;
	}
}
</style>
