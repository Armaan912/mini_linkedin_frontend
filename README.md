# Mini LinkedIn - Frontend

A modern Vue.js 3 frontend application for the Mini LinkedIn social networking platform. Built with Vue 3 Composition API, Pinia state management, and Bootstrap 5 for a professional LinkedIn-inspired design.

## 🚀 Tech Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vue Router 4** - Client-side routing with navigation guards
- **Pinia** - State management for Vue 3
- **Bootstrap 5** - CSS framework for responsive design
- **FontAwesome** - Icon library for professional UI
- **Axios** - HTTP client for API communication
- **Vuelidate** - Form validation library
- **SweetAlert2** - Beautiful alerts and notifications
- **Day.js** - Date manipulation and formatting
- **Vite** - Build tool and development server

## 📁 Project Structure

```
mini-linkedin/
├── public/
│   ├── vite.svg
│   └── default-avatar.png
├── src/
│   ├── assets/
│   │   └── vue.svg
│   ├── components/
│   │   ├── BaseInput.vue        # Reusable input component
│   │   ├── BaseTextarea.vue     # Reusable textarea component
│   │   ├── DefaultLayout.vue    # Main layout wrapper
│   │   ├── Header.vue           # Navigation header
│   │   └── PostCard.vue         # Post display component
│   ├── lib/
│   │   └── api/
│   │       └── axios.js         # Axios configuration
│   ├── router/
│   │   └── index.js             # Vue Router configuration
│   ├── services/
│   │   └── api.js               # API service functions
│   ├── store/
│   │   └── authStore.js         # Pinia auth store
│   ├── utils/                   # Utility functions
│   ├── views/
│   │   ├── Home.vue             # Main feed page
│   │   ├── LoginView.vue        # Login page
│   │   ├── MyPosts.vue          # User's posts page
│   │   ├── Profile.vue          # User profile page
│   │   ├── RegisterView.vue     # Registration page
│   │   └── Users.vue            # Users discovery page
│   ├── App.vue                  # Root component
│   ├── main.js                  # Application entry point
│   └── style.css                # Global styles
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
└── vercel.json                 # Vercel deployment config
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the mini-linkedin directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 🎨 Features

### Core Features
- **User Authentication** - Login/register with JWT tokens
- **Profile Management** - Edit profile with image upload
- **Post Creation** - Create posts with text and images
- **Social Interactions** - Like posts and add comments
- **User Discovery** - Browse and search other users
- **Responsive Design** - Mobile-first approach

### UI/UX Features
- **LinkedIn-Inspired Design** - Professional social network look
- **Real-time Updates** - Dynamic content without page refresh
- **Image Upload** - Profile pictures and post images
- **Search Functionality** - Find users by name
- **Mobile Responsive** - Optimized for all screen sizes
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 🧩 Components

### Core Components

#### `Header.vue`
- Navigation bar with user menu
- Responsive design for mobile/desktop
- User authentication status display

#### `PostCard.vue`
- Individual post display
- Like/unlike functionality
- Comment system
- Image display
- Author information

#### `BaseInput.vue` & `BaseTextarea.vue`
- Reusable form components
- Validation support
- Consistent styling

### Page Components

#### `Home.vue`
- Main feed with all posts
- Create post functionality
- Sidebar with user profile
- Mobile-optimized layout

#### `Profile.vue`
- User profile display
- Profile editing
- User's posts feed
- Bio and image management

#### `Users.vue`
- User discovery page
- Search functionality
- User grid layout
- Profile navigation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | - | Yes |

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

## 🚀 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile (< 768px)**: Single column layout, collapsible navigation
- **Tablet (768px - 992px)**: Two-column layout with sidebar
- **Desktop (> 992px)**: Three-column layout with full sidebar

## 🎯 State Management

### Pinia Store (`authStore.js`)
```javascript
// Authentication state management
const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  actions: {
    login(credentials),
    logout(),
    register(userData),
    loadUser()
  }
})
```

## 🔐 Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage
3. **Route Guards**: Protected routes check authentication
4. **API Calls**: Token included in Authorization header
5. **Auto-logout**: Token expiration handling

## 🎨 Styling

### Bootstrap 5 Integration
- Custom CSS variables for theming
- Responsive grid system
- Component styling
- Utility classes

### Custom Styles
- LinkedIn-inspired color scheme
- Professional typography
- Smooth animations
- Mobile-optimized components

## 📊 Performance

### Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images
- **Bundle Size**: Tree shaking and minification
- **Caching**: Browser caching strategies

### Monitoring
- **Build Analytics**: Bundle size tracking
- **Performance Metrics**: Core Web Vitals
- **Error Tracking**: User error reporting

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run with coverage
npm run test:coverage
```

## 🔧 Development Tools

### Vite DevTools
- Hot Module Replacement (HMR)
- Fast refresh
- Development server
- Build optimization

### Vue DevTools
- Component inspection
- State management debugging
- Performance profiling
- Timeline tracking

## 📦 Dependencies

### Production Dependencies
- `vue@^3.5.17` - Vue.js framework
- `vue-router@^4.5.1` - Client-side routing
- `pinia@^3.0.3` - State management
- `bootstrap@^5.3.7` - CSS framework
- `axios@^1.11.0` - HTTP client
- `@vuelidate/core@^2.0.3` - Form validation
- `sweetalert2@^11.22.2` - Notifications
- `dayjs@^1.11.13` - Date handling

### Development Dependencies
- `@vitejs/plugin-vue@^6.0.0` - Vue plugin for Vite
- `vite@^7.0.4` - Build tool
- `vite-plugin-vue-devtools@^8.0.0` - DevTools integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Vue.js 3 and Vite
- Styled with Bootstrap 5
- Icons from FontAwesome
- Deployed on Vercel
