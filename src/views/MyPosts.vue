<template>
	<div class="my-posts-container">
		<Header :user="user" @logout="logout" />
		<div class="container-fluid px-3 mt-3">
			<div class="row g-3">
				<div class="col-12 d-lg-none">
					<div class="mobile-profile-card">
						<div class="d-flex align-items-center mb-3">
							<img
								:src="getImageUrl(user?.profileImage) || '/default-avatar.png'"
								alt="Profile"
								class="mobile-profile-image me-3"
							/>
							<div class="flex-grow-1">
								<h5 class="mb-1">{{ user?.name }}</h5>
								<p class="text-muted mb-0 small">
									{{ user?.bio || "No bio yet" }}
								</p>
							</div>
						</div>
						<div class="d-flex gap-2">
							<button
								@click="$router.push('/home')"
								class="btn btn-primary btn-sm flex-grow-1"
							>
								<i class="fas fa-home"></i> Home
							</button>
							<button
								@click="$router.push('/profile')"
								class="btn btn-outline-primary btn-sm"
							>
								<i class="fas fa-user"></i>
							</button>
							<button
								@click="showCreatePost = true"
								class="btn btn-success btn-sm"
							>
								<i class="fas fa-plus"></i>
							</button>
						</div>
					</div>
				</div>

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
							<div class="d-grid gap-2">
								<button
									@click="$router.push('/home')"
									class="btn btn-primary btn-sm"
								>
									<i class="fas fa-home"></i> Home
								</button>
								<button
									@click="$router.push('/profile')"
									class="btn btn-outline-primary btn-sm"
								>
									<i class="fas fa-user"></i> My Profile
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

				<div class="col-12 col-lg-6">
					<div class="posts-container">
						<div class="posts-header">
							<div
								class="d-flex justify-content-between align-items-center mb-3"
							>
								<h5 class="mb-0"><i class="fas fa-list"></i> My Posts</h5>
								<button
									@click="showCreatePost = true"
									class="btn btn-primary btn-sm"
								>
									<i class="fas fa-plus"></i> Create New Post
								</button>
							</div>
						</div>

						<div class="posts-scroll-area">
							<div v-if="loading" class="text-center">
								<div class="spinner-border" role="status">
									<span class="visually-hidden">Loading...</span>
								</div>
							</div>

							<div v-else-if="posts.length === 0" class="text-center">
								<p class="text-muted">You haven't created any posts yet.</p>
								<button @click="showCreatePost = true" class="btn btn-primary">
									<i class="fas fa-plus"></i> Create Your First Post
								</button>
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
						<h6>Post Statistics</h6>
						<div class="stats">
							<div class="stat-item">
								<i class="fas fa-file-alt"></i>
								<span>{{ posts.length }} Posts</span>
							</div>
							<div class="stat-item">
								<i class="fas fa-thumbs-up"></i>
								<span>{{ totalLikes }} Total Likes</span>
							</div>
							<div class="stat-item">
								<i class="fas fa-comments"></i>
								<span>{{ totalComments }} Total Comments</span>
							</div>
						</div>
					</div>
				</div>

				<div class="col-12 d-lg-none">
					<div class="mobile-stats-bar">
						<div class="stat-item">
							<i class="fas fa-file-alt"></i>
							<span>{{ posts.length }}</span>
						</div>
						<div class="stat-item">
							<i class="fas fa-thumbs-up"></i>
							<span>{{ totalLikes }}</span>
						</div>
						<div class="stat-item">
							<i class="fas fa-comments"></i>
							<span>{{ totalComments }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div
			v-if="showCreatePost"
			class="modal-overlay"
			@click="showCreatePost = false"
		>
			<div class="modal-content" @click.stop>
				<div class="card">
					<div class="card-header">
						<h5 class="mb-0">Create a New Post</h5>
					</div>
					<div class="card-body">
						<form @submit.prevent="createPost">
							<div class="mb-3">
								<label class="form-label">What do you want to share?</label>
								<textarea
									v-model="newPost.content"
									class="form-control"
									rows="4"
									placeholder="Share your thoughts..."
									required
								></textarea>
							</div>
							<div class="mb-3">
								<label class="form-label">Add an image (optional)</label>
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
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "vue-router";
import PostCard from "../components/PostCard.vue";
import axios from "../lib/api/axios.js";
import Swal from "sweetalert2";
import Header from "../components/Header.vue";

const auth = useAuthStore();
const router = useRouter();

const user = auth.user;
const posts = ref([]);
const loading = ref(false);
const showCreatePost = ref(false);
const showUserDropdown = ref(false);
const newPost = ref({
	content: "",
	image: null
});

const totalLikes = computed(() => {
	return posts.value.reduce((total, post) => total + post.likes.length, 0);
});

const totalComments = computed(() => {
	return posts.value.reduce((total, post) => total + post.comments.length, 0);
});

onMounted(async () => {
	if (!user) {
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
	const dropdown = document.querySelector(".user-dropdown");
	if (dropdown && !dropdown.contains(event.target)) {
		showUserDropdown.value = false;
	}
};

const loadPosts = async () => {
	loading.value = true;
	try {
		posts.value = await getMyPosts();
	} catch (error) {
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "Failed to load posts",
			confirmButtonColor: "#dc3545"
		});
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
				_id: user._id,
				name: user.name,
				profileImage: user.profileImage
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
	if (!imagePath) return "";
	if (imagePath.startsWith("http")) {
		return imagePath;
	}
	return `https://mini-linkedin-backend-ornn.onrender.com/api/${imagePath}`;
};

const getMyPosts = async () => {
	const res = await axios.get("/posts/me");
	return res.data;
};

const createPostAPI = async (formData) => {
	const res = await axios.post("/posts", formData, {
		headers: { "Content-Type": "multipart/form-data" }
	});
	return res.data;
};
</script>

<style scoped>
.my-posts-container {
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

.mobile-profile-image {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	object-fit: cover;
}

.mobile-profile-card {
	background: white;
	border-radius: 8px;
	padding: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.posts-section {
	background: white;
	border-radius: 8px;
	padding: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.posts-container {
	height: calc(100vh - 120px);
	display: flex;
	flex-direction: column;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.stats {
	margin-top: 1rem;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
	font-size: 14px;
	color: #666;
}

.stat-item i {
	width: 16px;
	color: #0a66c2;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
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

.mobile-stats-bar {
	background: white;
	border-radius: 8px;
	padding: 0.75rem 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.mobile-stats-bar .stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.25rem;
	font-size: 12px;
	color: #666;
}

.mobile-stats-bar .stat-item i {
	font-size: 16px;
	color: #0a66c2;
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
