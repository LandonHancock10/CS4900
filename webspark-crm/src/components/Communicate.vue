<template>
    <div class="communicate-page">
      <!-- Full-width Header -->
      <header class="communicate-header">
        <div class="nav-content">
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
            <router-link to="/settings" class="menu-link">Settings</router-link>
          </nav>
        </div>
      </header>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CommunicatePage',
  };
  </script>
  
  <style scoped>
  /* Full page background */
  .communicate-page {
    background-color: #2B2D31; /* Dark grey background */
    height: 100vh;
    margin: 0;
  }

  /* Header bar */
  .communicate-header {
    background-color: #000000; /* Black bar */
    height: 80px; /* Set consistent height for the bar */
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center; /* Vertically center content */
    justify-content: center; /* Center the contents inside the header */
  }

  /* Flex container for the logo and menu */
  .nav-content {
    display: flex;
    align-items: center; /* Vertically center items */
    width: 100%;
    max-width: 1400px; /* Set max width for the nav content */
    margin: 0 auto; /* Center the nav content horizontally */
    position: relative;
  }

  /* Centered logo */
  .logo-container {
    position: absolute;
    left: 50%; /* Center horizontally */
    transform: translateX(-50%);
  }

  .logo {
    width: 50px; /* Adjust logo size */
    height: 50px;
    object-fit: cover;
  }

  /* Menu items container */
  .menu-items {
    display: flex;
    gap: 24px; /* Space between menu items */
    margin-left: auto; /* Push menu to the right */
  }

  /* Menu links */
  .menu-link {
    color: #F2F3F5; /* White text */
    font-size: 16px;
    text-decoration: none;
    font-weight: 600;
  }

  .menu-link:hover {
    color: #5865F2; /* Button hover blue */
  }
</style>
  