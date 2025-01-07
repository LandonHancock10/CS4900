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
/* Apply Discord’s "gg sans" font to the component */
* {
  font-family: 'gg sans', sans-serif;
}

/* Container for the login card */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #2B2D31; /* Discord second darkest background */
  border-radius: 8px;
  text-align: center;
}

/* Logo styling */
.logo-container {
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

/* Title and subtitle styling */
.title {
  font-size: 24px;
  font-weight: 700;
  color: #F2F3F5; /* Light text */
  margin-bottom: 10px;
}

.subtitle {
  color: #F2F3F5; /* Light text */
  font-size: 14px;
  margin-bottom: 100px;
}

/* Input fields */
.input-field {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #313338; /* Lightest background for borders */
  background-color: #1E1F22; /* Darkest background */
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  color: #F2F3F5; /* Light text for input */
}

.input-field::placeholder {
  color: #666666; /* Placeholder text */
}

/* Login button */
.login-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #5865F2; /* Discord button blue */
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #4752C4; /* Darker blue for hover */
}
</style>
