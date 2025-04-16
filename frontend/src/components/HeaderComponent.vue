<template>
  <header class="header">
    <div class="nav-content">
      <!-- User Profile Picture -->
      <div class="profile-picture-container">
        <img :src="userProfileUrl || defaultProfilePic" alt="User Profile" class="profile-picture" />
      </div>

      <!-- Centered Logo with Link -->
      <div class="logo-container">
        <router-link to="/communicate">
          <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
        </router-link>
      </div>

      <!-- Right-Aligned Menu -->
      <nav class="menu-items">
        <router-link to="/work" class="menu-link">Work</router-link>
        <router-link to="/communicate" class="menu-link">Communicate</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
import { getUser } from "@/services/apiService";
import defaultImage from "@/assets/logo.png";

export default {
  name: "HeaderComponent",
  data() {
    return {
      userProfileUrl: null,
      defaultProfilePic: defaultImage,
      userId: null,
      lastChecked: 0,
      users: [],
    };
  },
  mounted() {
    // Initial load
    this.getUserIdFromToken();

    // Set up interval to refresh profile every minute
    this.profileRefreshInterval = setInterval(() => {
      this.getUserIdFromToken();
    }, 60000); // Check every minute
  },
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.profileRefreshInterval) {
      clearInterval(this.profileRefreshInterval);
    }
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

        if (user && user.profilePicture) {
          console.log("Setting profile picture URL:", user.profilePicture);
          this.userProfileUrl = user.profilePicture;
        } else {
          console.log("No profile picture found for user");
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
</style>