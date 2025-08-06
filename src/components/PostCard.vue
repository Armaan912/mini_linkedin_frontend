<template>
  <div class="post-card">
    <div class="card mb-3">
      <div class="card-body">
        <div class="post-header d-flex align-items-center mb-3">
          <img 
            :src="getImageUrl(post.author.profileImage) || '/default-avatar.png'" 
            alt="Profile" 
            class="post-author-image"
          />
          <div class="post-author-info">
            <h6 class="mb-0">
              <span 
                class="author-name-link" 
                @click="viewUserProfile(post.author._id)"
                :title="`View ${post.author.name}'s profile`"
              >
                {{ post.author.name }}
              </span>
            </h6>
            <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
          </div>
        </div>

        <div class="post-content mb-3">
          <p class="mb-2">{{ post.content }}</p>
          <img 
            v-if="post.image" 
            :src="getImageUrl(post.image)" 
            alt="Post image" 
            class="post-image"
          />
        </div>

        <div class="post-stats mb-3">
          <small class="text-muted">
            {{ post.likes.length }} like{{ post.likes.length !== 1 ? 's' : '' }}
            {{ post.comments.length > 0 ? ` • ${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}` : '' }}
          </small>
        </div>

        <div class="post-actions border-top pt-3">
          <div class="row g-1">
            <div class="col-6">
              <button 
                @click="toggleLike" 
                class="btn btn-link text-decoration-none w-100 action-btn"
                :class="{ 'text-primary': isLiked }"
              >
                <i :class="isLiked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                <span class="action-text">{{ isLiked ? 'Liked' : 'Like' }}</span>
              </button>
            </div>
            <div class="col-6">
              <button 
                @click="showComments = !showComments" 
                class="btn btn-link text-decoration-none w-100 action-btn"
              >
                <i class="far fa-comment"></i>
                <span class="action-text">Comment</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="showComments" class="comments-section mt-3">
          <div class="add-comment mb-3">
            <div class="input-group">
              <input 
                v-model="newComment" 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Write a comment..."
                @keyup.enter="addComment"
              />
              <button 
                @click="addComment" 
                class="btn btn-primary btn-sm"
                :disabled="!newComment.trim()"
              >
                <span class="d-none d-sm-inline">Post</span>
                <i class="fas fa-paper-plane d-inline d-sm-none"></i>
              </button>
            </div>
          </div>

          <div v-if="post.comments.length > 0" class="comments-list">
            <div 
              v-for="comment in post.comments" 
              :key="comment._id" 
              class="comment-item"
            >
              <div class="d-flex align-items-start">
                <img 
                  :src="getImageUrl(comment.user.profileImage) || '/default-avatar.png'" 
                  alt="Profile" 
                  class="comment-author-image"
                />
                <div class="comment-content flex-grow-1">
                  <div class="comment-header">
                    <strong>{{ comment.user.name }}</strong>
                    <small class="text-muted ms-2">{{ formatDate(comment.createdAt) }}</small>
                  </div>
                  
                  <div v-if="editingComment && editingComment._id === comment._id" class="edit-comment-form">
                    <div class="input-group">
                      <input 
                        v-model="editText" 
                        type="text" 
                        class="form-control form-control-sm" 
                        @keyup.enter="saveComment"
                        @keyup.esc="editingComment = null"
                      />
                      <button @click="saveComment" class="btn btn-primary btn-sm">
                        Save
                      </button>
                      <button @click="editingComment = null" class="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <p v-else class="mb-1">{{ comment.text }}</p>
                  
                  <div v-if="comment.user._id === currentUser._id && !editingComment" class="comment-actions">
                    <button 
                      @click="editComment(comment)" 
                      class="btn btn-link btn-sm p-0 me-2"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteComment(comment._id)" 
                      class="btn btn-link btn-sm p-0 text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-muted">
            <small>No comments yet. Be the first to comment!</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/authStore.js';
import { useRouter } from 'vue-router';
import axios from '../lib/api/axios.js';
import Swal from 'sweetalert2';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['like', 'comment', 'delete-comment', 'edit-comment', 'refresh']);

const auth = useAuthStore();
const router = useRouter();
const currentUser = auth.user;

const showComments = ref(false);
const newComment = ref('');
const editingComment = ref(null);
const editText = ref('');

const isLiked = computed(() => {
  return props.post.likes.some(like => {
    if (typeof like === 'string') {
      return like === currentUser._id;
    }
    return like._id === currentUser._id || like === currentUser._id;
  });
});

const loadPosts = async () => {
  emit('refresh');
};

const formatDate = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `http://localhost:5000/${imagePath}`;
};

const toggleLike = async () => {
  try {
    const originalLikes = [...props.post.likes];
    
    const isCurrentlyLiked = isLiked.value;
    
    if (isCurrentlyLiked) {
      props.post.likes = props.post.likes.filter(like => {
        if (typeof like === 'string') {
          return like !== currentUser._id;
        }
        return like._id !== currentUser._id && like !== currentUser._id;
      });
    } else {
      props.post.likes.push(currentUser._id);
    }
    
    const response = await toggleLikePost(props.post._id);
    
    if (response.post) {
      props.post.likes = response.post.likes;
    }
    
    emit('like', props.post._id);
  } catch (error) {
    props.post.likes = originalLikes;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to toggle like',
      confirmButtonColor: '#dc3545',
    });
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;
  try {
    const newCommentObj = {
      _id: Date.now().toString(),
      user: { _id: currentUser._id, name: currentUser.name, profileImage: currentUser.profileImage },
      text: newComment.value,
      createdAt: new Date().toISOString()
    };
    props.post.comments.push(newCommentObj);
    const commentText = newComment.value;
    newComment.value = '';
    await addCommentToPost(props.post._id, commentText);
    const updatedPost = await getPostById(props.post._id);
    Object.assign(props.post, updatedPost);
    emit('comment', props.post._id, commentText);
  } catch (error) {
    await loadPosts();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to add comment',
      confirmButtonColor: '#dc3545',
    });
  }
};

const deleteComment = async (commentId) => {
  try {
    const commentIndex = props.post.comments.findIndex(c => c._id === commentId);
    if (commentIndex !== -1) {
      props.post.comments.splice(commentIndex, 1);
    }
    
    await deleteCommentFromPost(props.post._id, commentId);
    emit('delete-comment', props.post._id, commentId);
  } catch (error) {
    await loadPosts();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete comment',
      confirmButtonColor: '#dc3545',
    });
  }
};

const editComment = async (comment) => {
  const { value: newText } = await Swal.fire({
    title: 'Edit Comment',
    input: 'textarea',
    inputValue: comment.text,
    inputPlaceholder: 'Enter your comment...',
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Comment cannot be empty';
      }
    }
  });

  if (newText && newText !== comment.text) {
    try {
      comment.text = newText;
      
      await editCommentOnPost(props.post._id, comment._id, newText);
      emit('edit-comment', props.post._id, comment._id, newText);
    } catch (error) {
      await loadPosts();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to edit comment',
        confirmButtonColor: '#dc3545',
      });
    }
  }
};

const saveComment = async () => {
  if (!editText.value.trim()) {
    editingComment.value = null;
    return;
  }

  try {
    await editCommentOnPost(props.post._id, editingComment.value._id, editText.value);
    editingComment.value = null;
    emit('edit-comment', props.post._id, editingComment.value._id, editText.value);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to save comment',
      confirmButtonColor: '#dc3545',
    });
  }
};

const toggleLikePost = async (postId) => {
  const res = await axios.patch(`/posts/${postId}/like`);
  return res.data;
};

const addCommentToPost = async (postId, text) => {
  const res = await axios.post(`/posts/${postId}/comment`, { text });
  return res.data;
};

const deleteCommentFromPost = async (postId, commentId) => {
  const res = await axios.delete(`/posts/${postId}/comment`, {
    data: { commentId }
  });
  return res.data;
};

const editCommentOnPost = async (postId, commentId, text) => {
  const res = await axios.put(`/posts/${postId}/comment`, { commentId, text });
  return res.data;
};

const getPostById = async (postId) => {
  const res = await axios.get(`/posts/${postId}`);
  return res.data;
};

const viewUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
};
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

@media (min-width: 576px) {
  .post-author-image {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }
}

.post-author-info h6 {
  font-weight: 600;
  color: #0a66c2;
}

.author-name-link {
  cursor: pointer;
  transition: color 0.2s ease;
}

.author-name-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.post-content p {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 575px) {
  .post-content p {
    font-size: 13px;
  }
}

.post-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 8px;
}

@media (min-width: 576px) {
  .post-image {
    max-height: 400px;
  }
}

.action-btn {
  color: #666;
  font-size: 13px;
  font-weight: 500;
  padding: 0.5rem 0.25rem;
}

.action-text {
  margin-left: 0.25rem;
}

@media (max-width: 575px) {
  .action-btn {
    font-size: 12px;
    padding: 0.4rem 0.2rem;
  }
  
  .action-text {
    display: none;
  }
}

@media (min-width: 576px) {
  .action-btn {
    font-size: 14px;
    padding: 0.5rem 0.5rem;
  }
}

.action-btn:hover {
  background-color: #f3f2ef;
}

.comment-author-image {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 6px;
}

@media (min-width: 576px) {
  .comment-author-image {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
}

.comment-item {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

@media (min-width: 576px) {
  .comment-item {
    padding: 8px 0;
  }
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  font-size: 13px;
}

@media (min-width: 576px) {
  .comment-content {
    font-size: 14px;
  }
}

.comment-header {
  margin-bottom: 4px;
}

.comment-actions {
  margin-top: 4px;
}

.edit-comment-form {
  margin: 8px 0;
}

.edit-comment-form .input-group {
  gap: 4px;
}

.edit-comment-form .btn {
  font-size: 11px;
  padding: 3px 6px;
}

@media (min-width: 576px) {
  .edit-comment-form .btn {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style> 