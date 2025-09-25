<template>
  <div
    class="modal fade"
    :class="{ show: show }"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
    @click.self="handleClose"
    aria-modal="true"
    aria-hidden="!show"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h5>
          <button
            v-if="!disableClose"
            type="button"
            class="btn-close"
            @click="handleClose"
            aria-label="Đóng"
          ></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
    <div v-if="show" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  disableClose: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);
const handleClose = () => {
  if (!props.disableClose) emit('close');
};
</script>

<style scoped>
.modal {
  z-index: 1050;
}
.modal-backdrop {
  z-index: 1040;
}
</style> 