<script setup lang="ts"></script>

<template>
  <RouterView />
  <ConfirmDialog />
  <Toast />
</template>

<style lang="scss">
// Main Stylesheet
@use "@/assets/scss/main";
// @import "@/assets/scss/main";

// All color themes are included and available by default
// Feel free to comment out any of them if you won't use them in your project
@use "@/assets/scss/oneui/themes/amethyst";
@use "@/assets/scss/oneui/themes/city";
@use "@/assets/scss/oneui/themes/flat";
@use "@/assets/scss/oneui/themes/modern";
@use "@/assets/scss/oneui/themes/smooth";
// @import "@/assets/scss/oneui/themes/amethyst";
// @import "@/assets/scss/oneui/themes/city";
// @import "@/assets/scss/oneui/themes/flat";
// @import "@/assets/scss/oneui/themes/modern";
// @import "@/assets/scss/oneui/themes/smooth";
</style>
