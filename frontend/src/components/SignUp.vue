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

      <label class="file-upload-label">
        Profile Picture
        <input type="file" @change="handleProfilePicture" class="input-field" accept="image/*" />
      </label>
      <p v-if="profilePicture">{{ profilePicture.name }}</p>

      <button type="submit" class="signup-button">Create Account</button>
    </form>
  </div>
</template>

<script>
import { createUser } from "@/services/apiService"; // ✅ Now uses the correct API service
import { v4 as uuidv4 } from "uuid";

export default {
  name: "SignUp",
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profilePicture: null,
      errors: {}, // Store validation errors
    };
  },
  methods: {
    handleProfilePicture(event) {
      this.profilePicture = event.target.files[0]; // Get the selected file
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

      const userData = {
        userId: uuidv4(), // Generate unique userId
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password, // Password should be hashed for security in production
        profilePicture: this.profilePicture ? this.profilePicture.name : null,
      };

      try {
        const response = await createUser(userData); // ✅ API call instead of direct database import
        if (response.success) {
          console.log("User created successfully:", response);
          this.$router.push("/"); // Redirect to login page after signup
        } else {
          alert(response.message || "Error creating account.");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        alert("An error occurred while creating the account.");
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

.signup-button:hover {
  background-color: #4752c4;
}
</style>
