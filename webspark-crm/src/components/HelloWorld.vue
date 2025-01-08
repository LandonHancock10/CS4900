<template>
  <div class="login-card">
    <!-- Logo -->
    <div class="logo-container">
      <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
    </div>

    <h1 class="title">{{"Welcome Back"}}</h1>
    <p class="subtitle">
      New here?
      <router-link to="/signup" class="signup-link">Create an account</router-link>
    </p>

    <!-- Form Fields -->
    <form class="login-form">
      <input type="email" placeholder="Email" class="input-field" />
      <input type="password" placeholder="Password" class="input-field" />
      <button type="submit" class="login-button">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
};
</script>

<style scoped>
* {
  font-family: 'gg sans', sans-serif;
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

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #2B2D31;
  border-radius: 8px;
  text-align: center;
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
  color: #F2F3F5;
  margin-bottom: 10px;
}

.subtitle {
  color: #F2F3F5;
  font-size: 14px;
  margin-bottom: 100px;
}

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

.login-button {
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

.login-button:hover {
  background-color: #4752C4;
}
</style>
