<template>
  <div class="login-card">
    <!-- Logo placeholder -->
    <div class="logo-container">
      <img src="@/assets/WebsparkFavicon.png" alt="App Logo" class="logo" />
    </div>

    <!-- Welcome message -->
    <h1 class="title">{{ msg }}</h1>
    <p class="subtitle">New here? Create an account</p>

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
/* Container for the login card */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #ffffff; /* White card */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Logo styling */
.logo-container {
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

/* Title and subtitle styling */
.title {
  font-size: 24px;
  font-weight: bold;
  color: #000000; /* Black text */
  margin-bottom: 10px;
}

.subtitle {
  color: #666666;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Input fields */
.input-field {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

/* Login button */
.login-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #42b983;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #359a6d;
}
</style>
