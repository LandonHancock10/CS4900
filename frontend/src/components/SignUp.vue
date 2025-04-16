<template>
  <div class="signup-card">
    <div class="logo-container">
      <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
    </div>
    <h1 class="title">Sign Up</h1>
    <p class="subtitle">
      Looking to log in? <router-link to="/" class="login-link">Log in here</router-link>
    </p>
    <form @submit.prevent="registerUser" class="signup-form">
      <input type="text" v-model="firstName" placeholder="First Name" class="input-field" />
      <p v-if="errors.firstName" class="error-text">{{ errors.firstName }}</p>

      <input type="text" v-model="lastName" placeholder="Last Name" class="input-field" />
      <p v-if="errors.lastName" class="error-text">{{ errors.lastName }}</p>

      <input type="email" v-model="email" placeholder="Email" class="input-field" />
      <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

      <input type="password" v-model="password" placeholder="Password" class="input-field" />
      <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

      <div class="profile-picture-section">
        <label class="file-upload-label">
          Profile Picture
          <input type="file" @change="handleProfilePicture" class="input-field" accept="image/*" />
        </label>
        
        <!-- Add preview of selected image -->
        <div v-if="profilePicture" class="preview-container">
          <img :src="profilePreview" alt="Profile Preview" class="preview-image" />
          <p class="file-name">{{ profilePicture.name }}</p>
        </div>
      </div>

      <button type="submit" class="signup-button" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>
  </div>
</template>

<script>
import { createUser, uploadUserProfilePicture } from "@/services/apiService";

export default {
  name: "SignUp",
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profilePicture: null,
      profilePreview: null,
      errors: {}, // Store validation errors
      isSubmitting: false,
      profilePictureBase64: null,
    };
  },
  methods: {
    handleProfilePicture(event) {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    this.profilePicture = file;
    
    // Create a canvas to resize the image
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
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
        this.profilePreview = canvas.toDataURL('image/jpeg', 0.7);
        this.profilePictureBase64 = this.profilePreview;
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
},
    
    validateForm() {
      this.errors = {};

      if (!this.firstName.trim()) {
        this.errors.firstName = "First name is required";
      }
      if (!this.lastName.trim()) {
        this.errors.lastName = "Last name is required";
      }
      if (!this.email.trim() || !this.email.includes("@")) {
        this.errors.email = "Valid email is required";
      }
      if (this.password.length < 6) {
        this.errors.password = "Password must be at least 6 characters long";
      }

      return Object.keys(this.errors).length === 0;
    },

    async registerUser() {
  if (!this.validateForm()) {
    alert("Please correct the errors in the form.");
    return;
  }

  this.isSubmitting = true;

  try {
    // Create user without profile picture first
    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    // Create the user
    console.log("Creating user...");
    const response = await createUser(userData);
    
    if (response.success && response.userId) {
      console.log(`User created successfully with backend-generated ID: ${response.userId}`);
      
      // If profile picture was selected, upload it using backend-generated userId
      if (this.profilePictureBase64) {
        try {
          // Wait to ensure the user is fully propagated in DynamoDB
          console.log("Waiting for user creation to complete...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`Uploading profile picture for user: ${response.userId}`);
          const uploadResponse = await uploadUserProfilePicture(response.userId, this.profilePictureBase64);
          console.log("Profile picture uploaded:", uploadResponse);
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          // Continue anyway since the user was created
        }
      }
      
      console.log("User created successfully:", response);
      this.$router.push("/"); // Redirect to login page after signup
    } else {
      alert(response.message || "Error creating account.");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    alert("An error occurred while creating the account.");
  } finally {
    this.isSubmitting = false;
  }
},
  },
};
</script>

<style scoped>
* {
  font-family: "gg sans", sans-serif;
}

.signup-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #2b2d31;
  border-radius: 8px;
  text-align: center;
  color: #f2f3f5;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #f2f3f5;
  margin-bottom: 10px;
}

.subtitle {
  color: #f2f3f5;
  font-size: 14px;
  margin-bottom: 20px;
}

.login-link {
  color: #5865f2;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.login-link:hover {
  color: #4752c4;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #313338;
  background-color: #1e1f22;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  color: #f2f3f5;
}

.input-field::placeholder {
  color: #666666;
}

.file-upload-label {
  text-align: left;
  font-size: 14px;
  color: #f2f3f5;
  display: block;
  margin-bottom: 10px;
}

.profile-picture-section {
  margin-bottom: 16px;
}

.preview-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #5865f2;
  margin-bottom: 5px;
}

.file-name {
  font-size: 12px;
  color: #b9bbbe;
}

.error-text {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: left;
}

.signup-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #5865f2;
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.signup-button:hover:not(:disabled) {
  background-color: #4752c4;
}

.signup-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>