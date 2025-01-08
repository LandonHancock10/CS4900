<template>
  <div class="login-card">
    <div class="logo-container">
      <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
    </div>
    <h1 class="title">Welcome Back</h1>
    <p class="subtitle">
      New here?
      <router-link to="/signup" class="signup-link">Create an account</router-link>
    </p>

    <!-- Form Fields -->
    <form @submit.prevent="loginUser" class="login-form">
      <input type="email" v-model="email" placeholder="Email" class="input-field" />
      <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

      <input type="password" v-model="password" placeholder="Password" class="input-field" />
      <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

      <button type="submit" class="login-button">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      errors: {}, // Store validation errors
    };
  },
  methods: {
    validateForm() {
      this.errors = {};

      if (!this.email.trim() || !this.email.includes('@')) {
        this.errors.email = 'Valid email is required';
      }
      if (this.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long';
      }

      return Object.keys(this.errors).length === 0;
    },
    loginUser() {
      if (!this.validateForm()) {
        alert('Please correct the errors in the form.');
        return;
      }

      console.log('Logging in user:', {
        email: this.email,
        password: this.password,
      });

      // Placeholder for backend connection
      alert('Logged in successfully!');
    },
  },
};
</script>

<style scoped>
* {
  font-family: 'gg sans', sans-serif;
}

.login-card {
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

.signup-link {
  color: #5865f2;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.signup-link:hover {
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

.error-text {
  color: #ff4d4f; /* Red color for error text */
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: left;
}

.login-button {
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

.login-button:hover {
  background-color: #4752c4;
}
</style>
