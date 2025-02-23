<template>
    <div class="work-page">
      <HeaderComponent />
      <div class="content-area"></div> <!-- Add your content here -->
    </div>
  </template>
  
  <script>
  import HeaderComponent from "@/components/HeaderComponent.vue";
  
  export default {
    name: "WorkPage",
    components: {
      HeaderComponent,
    },
  };
  </script>
  
  <style scoped>
  .work-page {
    background-color: #2B2D31;
    height: 100vh;
    padding-top: 80px; /* Add padding to avoid content under the header */
  }
  </style>
  