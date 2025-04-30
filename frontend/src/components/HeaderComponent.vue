<template>
  <header class="header">
    <div class="nav-content">
      <!-- User Profile Picture with Dropdown -->
      <div class="profile-picture-container" @click="toggleDropdown" ref="profileContainer">
        <img :src="userProfileUrl || defaultProfilePic" alt="User Profile" class="profile-picture" />
        
        <!-- Dropdown Menu -->
        <div class="dropdown-menu" v-if="showDropdown">
          <div class="dropdown-header">
            <img :src="userProfileUrl || defaultProfilePic" alt="User Profile" class="dropdown-profile-pic" />
            <div class="user-info">
              <p class="user-name">{{ userName || 'User' }}</p>
              <p class="user-email">{{ userEmail || 'user@example.com' }}</p>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="openChangePictureModal">
            <span class="dropdown-icon">🖼️</span>
            Change Profile Picture
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout" @click="logout">
            <span class="dropdown-icon">🚪</span>
            Logout
          </div>
        </div>
      </div>

      <!-- Centered Logo with Link -->
      <div class="logo-container">
        <router-link to="/communicate">
          <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
        </router-link>
      </div>

      <!-- Right-Aligned Menu -->
      <nav class="menu-items">
      </nav>
    </div>
    
    <!-- Change Profile Picture Modal -->
    <div class="modal-overlay" v-if="showChangePictureModal">
      <div class="modal">
        <h2>Change Profile Picture</h2>
        <div class="profile-preview">
          <img :src="previewImage || userProfileUrl || defaultProfilePic" alt="Profile Preview" class="preview-img" />
          <input type="file" @change="handleImageUpload" accept="image/*" />
        </div>
        <div class="button-group">
          <button class="save-button" @click="updateProfilePicture" :disabled="loading || !newProfilePicture">
            {{ loading ? 'Uploading...' : 'Save Changes' }}
          </button>
          <button class="cancel-button" @click="cancelProfileChange">Cancel</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { getUser, uploadUserProfilePicture, logoutUser } from "@/services/apiService";
import defaultImage from "@/assets/logo.png";

export default {
  name: "HeaderComponent",
  data() {
    return {
      userProfileUrl: null,
      defaultProfilePic: defaultImage,
      userId: null,
      userName: null,
      userEmail: null,
      firstName: null,
      lastName: null,
      lastChecked: 0,
      users: [],
      showDropdown: false,
      showChangePictureModal: false,
      newProfilePicture: null,
      previewImage: null,
      loading: false
    };
  },
  mounted() {
    // Initial load
    this.getUserIdFromToken();

    // Set up interval to refresh profile every minute
    this.profileRefreshInterval = setInterval(() => {
      this.getUserIdFromToken();
    }, 60000); // Check every minute
    
    // Close dropdown when clicking outside
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.profileRefreshInterval) {
      clearInterval(this.profileRefreshInterval);
    }
    
    // Remove event listener
    document.removeEventListener("click", this.handleOutsideClick);
  },
  watch: {
    // Watch for route changes to refresh profile
    '$route'() {
      // Only refresh if it's been more than 10 seconds since last check
      const now = Date.now();
      if (now - this.lastChecked > 10000) {
        this.getUserIdFromToken();
        this.lastChecked = now;
      }
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    
    handleOutsideClick(event) {
      if (this.$refs.profileContainer && !this.$refs.profileContainer.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    
    openChangePictureModal() {
      this.previewImage = null;
      this.newProfilePicture = null;
      this.showChangePictureModal = true;
      this.showDropdown = false;
    },
    
    cancelProfileChange() {
      this.previewImage = null;
      this.newProfilePicture = null;
      this.showChangePictureModal = false;
    },
    
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
        
        // Create a canvas to resize the image
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions (max 500px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 500;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed base64 (0.7 quality JPEG)
          this.newProfilePicture = canvas.toDataURL('image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    async updateProfilePicture() {
      if (!this.newProfilePicture) return;
      
      try {
        this.loading = true;
        
        const response = await uploadUserProfilePicture(this.userId, this.newProfilePicture);
        
        if (response.success) {
          this.userProfileUrl = response.profilePictureUrl;
          this.showChangePictureModal = false;
          this.previewImage = null;
          this.newProfilePicture = null;
          alert("Profile picture updated successfully!");
        } else {
          alert("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Failed to update profile picture: " + (error.message || "Unknown error"));
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      // Use the logout function from your apiService
      logoutUser();
      
      // Redirect to login page
      this.$router.push("/");
    },

    getUserIdFromToken() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Parse the JWT token to get user ID
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );

          const payload = JSON.parse(jsonPayload);
          this.userId = payload.userId;

          // Load user profile if we have a user ID
          if (this.userId) {
            this.loadUserProfile();
          }
        } catch (error) {
          console.error("Error parsing token:", error);
        }
      }
    },

    async loadUserProfile() {
      try {
        console.log("Loading user profile for ID:", this.userId);
        const user = await getUser(this.userId);
        console.log("User data received:", user);

        if (user) {
          if (user.profilePicture) {
            this.userProfileUrl = user.profilePicture;
          }
          
          this.firstName = user.firstName || "";
          this.lastName = user.lastName || "";
          this.userName = `${this.firstName} ${this.lastName}`;
          this.userEmail = user.email || "";
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Header bar */
.header {
  background-color: #000000;
  /* Black bar */
  height: 80px;
  /* Set consistent height for the bar */
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  /* Vertically center content */
  justify-content: center;
  z-index: 100000;
}

/* Flex container for the logo, profile picture, and menu */
.nav-content {
  display: flex;
  align-items: center;
  /* Vertically center items */
  width: 100%;
  max-width: 95%;
  /* Set max width for the nav content */
  margin: 0 auto;
  /* Center the nav content horizontally */
  position: relative;
}

/* Profile picture container */
.profile-picture-container {
  margin-right: 16px;
  /* Add spacing between profile picture and logo */
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Maintain aspect ratio and cover the entire container */
  border-radius: 50%;
  /* Make it circular */
  border: 2px solid #ffffff;
  /* Optional border for aesthetics */
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 50px;
  left: 0;
  width: 250px;
  background-color: #2B2D31;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 15px;
  display: flex;
  align-items: center;
  background-color: #1E1F22;
}

.dropdown-profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #5865F2;
}

.user-info {
  margin-left: 10px;
}

.user-name {
  color: white;
  font-weight: bold;
  margin: 0;
  font-size: 14px;
}

.user-email {
  color: #B9BBBE;
  margin: 0;
  font-size: 12px;
}

.dropdown-divider {
  height: 1px;
  background-color: #36393F;
  margin: 0;
}

.dropdown-item {
  padding: 12px 15px;
  color: #DCDDDE;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.dropdown-icon {
  margin-right: 10px;
  font-size: 16px;
}

.dropdown-item:hover {
  background-color: #36393F;
}

.dropdown-item.logout {
  color: #ED4245;
}

/* Centered logo */
.logo-container {
  position: absolute;
  left: 50%;
  /* Center horizontally */
  transform: translateX(-50%);
}

.logo {
  width: 60px;
  /* Adjust logo size */
  height: 60px;
  object-fit: cover;
  cursor: pointer;
  /* Makes it clear that the logo is clickable */
}

/* Menu items container */
.menu-items {
  display: flex;
  gap: 24px;
  /* Space between menu items */
  margin-left: auto;
  /* Push menu to the right */
}

/* Menu links */
.menu-link {
  color: #F2F3F5;
  /* White text */
  font-size: 16px;
  text-decoration: none;
  font-weight: 600;
}

.menu-link:hover {
  color: #5865F2;
  /* Button hover blue */
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
}

.modal {
  background: #2B2D31;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  color: #FFFFFF;
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: #B9BBBE;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #1E1F22;
  color: #FFFFFF;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-button, .cancel-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.save-button {
  background-color: #5865F2;
  color: white;
}

.save-button:hover {
  background-color: #4752C4;
}

.save-button:disabled {
  background-color: #3C3F44;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #36393F;
  color: #DCDDDE;
}

.cancel-button:hover {
  background-color: #2E3035;
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.preview-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #5865F2;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .dropdown-menu {
    width: 220px;
  }
  
  .modal {
    width: 95%;
  }
}
</style>