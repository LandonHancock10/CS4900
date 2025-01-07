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
body {
  margin: 0;
  padding: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  background-image: url('@/assets/Website Prototype.png'); /* Black background */
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Full screen height */
}
</style>
