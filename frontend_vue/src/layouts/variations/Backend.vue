<script setup lang="ts">
import { useTemplateStore } from "@/stores/template";
import TokenExpiryWarning from "@/components/TokenExpiryWarning.vue";

import BaseLayout from "@/layouts/BaseLayout.vue";

// Main store
const store = useTemplateStore();

// Set default elements for this layout
store.setLayout({
  header: true,
  sidebar: true,
  sideOverlay: true,
  footer: true,
});

// Set various template options for this layout variation
store.headerStyle({ mode: "light" });
store.mainContent({ mode: "full" });
</script>

<template>
  <BaseLayout>
    <RouterView />
    <TokenExpiryWarning />
  </BaseLayout>
</template>
