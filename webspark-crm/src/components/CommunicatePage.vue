<template>
  <div class="communicate-page">
    <HeaderComponent />
    <div class="content-area"></div> <!-- Add your content here -->
  </div>
</template>

<script>
import HeaderComponent from "@/components/HeaderComponent.vue";

export default {
  name: "CommunicatePage",
  components: {
    HeaderComponent,
  },
};
</script>

<style scoped>
.communicate-page {
  background-color: #2B2D31;
  height: 100vh;
  padding-top: 80px; /* Add padding to avoid content under the header */
}
</style>
