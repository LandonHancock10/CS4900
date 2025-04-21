<template>
  <div id="app" class="app-container">
    <!-- Only display components via router -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Font Face Definitions */
@font-face {
  font-family: 'gg sans';
  src: url('@/assets/fonts/gg sans Regular.ttf') format('truetype');
  font-weight: 400;
}

@font-face {
  font-family: 'gg sans';
  src: url('@/assets/fonts/gg sans Bold.ttf') format('truetype');
  font-weight: 700;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'gg sans', sans-serif;
  background-color: #1E1F22;
  color: #F2F3F5;
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

@media (max-width: 768px) {
.app-container{
  padding-left: 0px;
  padding-right: 0px;
}

}
</style>
