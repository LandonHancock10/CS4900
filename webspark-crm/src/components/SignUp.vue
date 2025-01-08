<template>
    <div class="signup-card">
      <!-- Logo -->
      <div class="logo-container">
        <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
      </div>
  
      <!-- Title and subtitle -->
      <h1 class="title">Sign Up</h1>
      <p class="subtitle">
        Already have an account?
        <router-link to="/" class="login-link">Log in here</router-link>
      </p>
  
      <!-- Form Fields -->
<form @submit.prevent="registerUser" class="signup-form">
  <input type="text" v-model="firstName" placeholder="First Name" class="input-field" />
  <input type="text" v-model="lastName" placeholder="Last Name" class="input-field" />
  <input type="email" v-model="email" placeholder="Email" class="input-field" />
  <input type="password" v-model="password" placeholder="Password" class="input-field" />
  
  <!-- Profile Picture Upload -->
  <label for="profile-picture" class="file-upload-label">Upload Profile Picture (Optional)</label>
  <input id="profile-picture" type="file" @change="handleProfilePicture" class="input-field file-upload-input" accept="image/*" />
  
  <button type="submit" class="signup-button">Create Account</button>
</form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SignUp',
    data() {
      return {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        profilePicture: null,
      };
    },
    methods: {
      handleProfilePicture(event) {
        this.profilePicture = event.target.files[0]; // Get the selected file
      },
      registerUser() {
        // For now, just log the form data to console.
        console.log('Registering user:', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          profilePicture: this.profilePicture ? this.profilePicture.name : 'No file selected',
        });
  
        alert('Account created successfully!');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Font Style */
  * {
    font-family: 'gg sans', sans-serif;
  }

  .file-upload-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #F2F3F5;
  text-align: left;
}

.file-upload-input {
  padding: 12px 16px;
  border: 1px solid #313338;
  background-color: #1E1F22;
  color: #F2F3F5;
  border-radius: 4px;
  cursor: pointer;
}

.file-upload-input::file-selector-button {
  background-color: #5865F2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.file-upload-input::file-selector-button:hover {
  background-color: #4752C4;
}
  
  /* Sign Up Link */
  .login-link {
    color: #5865f2;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }
  
  .login-link:hover {
    color: #4752c4;
  }
  
  /* Card Container */
  .signup-card {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: #2B2D31;
    border-radius: 8px;
    text-align: center;
  }
  
  /* Logo Styling */
  .logo-container {
    margin-bottom: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    object-fit: cover;
  }
  
  /* Title and Subtitle */
  .title {
    font-size: 24px;
    font-weight: 700;
    color: #F2F3F5;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #F2F3F5;
    font-size: 14px;
    margin-bottom: 30px;
  }
  
  /* Input Fields */
  .input-field {
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid #313338;
    background-color: #1E1F22;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
    color: #F2F3F5;
  }
  
  .input-field::placeholder {
    color: #666666;
  }
  
  /* Sign Up Button */
  .signup-button {
    width: 100%;
    padding: 12px 16px;
    background-color: #5865F2;
    color: white;
    font-size: 18px;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .signup-button:hover {
    background-color: #4752C4;
  }
  </style>
  