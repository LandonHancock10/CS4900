<template>
  <div id="app" class="app-container">
    <HelloWorld msg="Welcome Back" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
};
</script>

<style>
@font-face {
  font-family: 'gg sans';
  src: url('@/assets/fonts/gg sans Regular.ttf') format('truetype');
  font-weight: 400; /* Normal weight */
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
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
</style>
