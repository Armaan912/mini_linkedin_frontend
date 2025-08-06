<template>
	<div v-if="userLoading" class="home-container">
		<div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	</div>
	<div v-else class="home-container">
		<Header :user="user" @logout="logout" />
		<div class="container-fluid px-3 mt-3">
			<div class="row g-3">
				<div class="col-lg-3 d-none d-lg-block">
					<div class="sidebar-card">
						<div class="profile-section">
							<img
								:src="getImageUrl(user?.profileImage) || '/default-avatar.png'"
								alt="Profile"
								class="large-profile-image"
							/>
							<h5>{{ user?.name }}</h5>
							<p class="text-muted">{{ user?.bio || "No bio yet" }}</p>
							<button
								@click="showCreatePost = true"
								class="btn btn-primary btn-sm w-100"
							>
								<i class="fas fa-plus"></i> Create Post
							</button>
						</div>
					</div>
				</div>

				<div class="col-12 col-lg-6">
					<div class="posts-container">
						<div class="d-lg-none mb-3">
							<button
								@click="showCreatePost = true"
								class="btn btn-primary w-100"
							>
								<i class="fas fa-plus"></i> What's on your mind?
							</button>
						</div>

						<div v-if="showCreatePost" class="post-card mb-4">
							<div class="card">
								<div class="card-body">
									<h6 class="card-title">Create a Post</h6>
									<form @submit.prevent="createPost">
										<div class="mb-3">
											<textarea
												v-model="newPost.content"
												class="form-control"
												rows="4"
												placeholder="What do you want to talk about?"
											></textarea>
										</div>
										<div class="mb-3">
											<input
												type="file"
												@change="handleImageUpload"
												accept="image/*"
												class="form-control"
											/>
										</div>
										<div class="d-flex justify-content-between">
											<button
												type="button"
												@click="showCreatePost = false"
												class="btn btn-secondary"
											>
												Cancel
											</button>
											<button
												type="submit"
												class="btn btn-primary"
												:disabled="!newPost.content.trim()"
											>
												Post
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>

						<div class="posts-scroll-area">
							<div v-if="loading" class="text-center">
								<div class="spinner-border" role="status">
									<span class="visually-hidden">Loading...</span>
								</div>
							</div>

							<div v-else-if="posts.length === 0" class="text-center">
								<p class="text-muted">
									No posts yet. Be the first to share something!
								</p>
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
							<button
								@click="$router.push('/profile')"
								class="btn btn-outline-primary btn-sm"
							>
								<i class="fas fa-user"></i> My Profile
							</button>
							<button
								@click="$router.push('/my-posts')"
								class="btn btn-outline-secondary btn-sm"
							>
								<i class="fas fa-list"></i> My Posts
							</button>
							<button
								@click="$router.push('/users')"
								class="btn btn-outline-info btn-sm"
							>
								<i class="fas fa-users"></i> Browse Users
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "vue-router";
import PostCard from "../components/PostCard.vue";
import axios from "../lib/api/axios.js";
import Swal from "sweetalert2";
import Header from "../components/Header.vue";

const auth = useAuthStore();
const router = useRouter();

const user = ref(null);
const posts = ref([]);
const loading = ref(false);
const userLoading = ref(true);
const showCreatePost = ref(false);
const newPost = ref({
	content: "",
	image: null
});

onMounted(async () => {
	// Wait for user to be loaded
	await auth.loadUser();
	user.value = auth.user;
	userLoading.value = false;
	
	if (!user.value) {
		router.push("/login");
		return;
	}
	await loadPosts();
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
	// This function is kept for potential future use
	// Currently not needed as user dropdown is handled in Header component
};

const loadPosts = async () => {
	loading.value = true;
	try {
		posts.value = await getPosts();
	} catch (error) {
		console.error("Error loading posts:", error);
	} finally {
		loading.value = false;
	}
};

const handleImageUpload = (event) => {
	newPost.value.image = event.target.files[0];
};

const createPost = async () => {
	try {
		const optimisticPost = {
			_id: Date.now().toString(),
			author: {
				_id: user.value._id,
				name: user.value.name,
				profileImage: user.value.profileImage
			},
			content: newPost.value.content,
			image: newPost.value.image
				? URL.createObjectURL(newPost.value.image)
				: "",
			likes: [],
			comments: [],
			createdAt: new Date().toISOString()
		};
		posts.value.unshift(optimisticPost);

		const formData = new FormData();
		formData.append("content", newPost.value.content);
		if (newPost.value.image) {
			formData.append("image", newPost.value.image);
		}

		newPost.value = { content: "", image: null };
		showCreatePost.value = false;

		await createPostAPI(formData);
		await loadPosts();
	} catch (error) {
		posts.value.shift();
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "Failed to create post",
			confirmButtonColor: "#dc3545"
		});
	}
};

const getPosts = async () => {
	const res = await axios.get("/posts/feed");
	return res.data;
};

const createPostAPI = async (formData) => {
	const res = await axios.post("/posts", formData, {
		headers: { "Content-Type": "multipart/form-data" }
	});
	return res.data;
};

const getImageUrl = (imagePath) => {
	if (!imagePath) return "";
	if (imagePath.startsWith("http")) {
		return imagePath;
	}
	return `https://mini-linkedin-backend-ornn.onrender.com/${imagePath}`;
};

const toggleLike = async (postId) => {};

const addComment = async (postId, comment) => {};

const deleteComment = async (postId, commentId) => {};

const editComment = async (postId, commentId, text) => {};

const refreshPosts = async () => {
	await loadPosts();
};

const logout = () => {
	auth.logout();
	router.push("/login");
};
</script>

<style scoped>
.home-container {
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

.large-profile-image {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	object-fit: cover;
	margin-bottom: 1rem;
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
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (min-width: 992px) {
	.sidebar-card {
		padding: 1.5rem;
	}
}

.profile-section {
	text-align: center;
}

.post-card {
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 1rem;
}

.posts-container {
	height: calc(100vh - 120px);
	display: flex;
	flex-direction: column;
}

.posts-scroll-area {
	flex: 1;
	overflow-y: auto;
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

	.gap-3 {
		gap: 0.75rem !important;
	}

	.mt-4 {
		margin-top: 1rem !important;
	}
}
</style>
