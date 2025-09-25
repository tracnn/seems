<template>
  <!-- Page Content -->
  <div class="hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center push">
        <div class="col-md-8 col-lg-6 col-xl-4">
          <!-- Sign In Block -->
          <BaseBlock title="Đăng nhập" class="mb-0">
            <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5">
              <h1 class="h2 mb-1">qHIS Plus</h1>
              <p class="fw-medium text-muted">Chào mừng bạn đã quay trở lại.</p>

              <!-- Sign In Form -->
              <form @submit.prevent="onSubmit">
                <div class="py-3">
                  <div class="mb-4">
                    <input
                      type="text"
                      class="form-control form-control-alt form-control-lg"
                      id="login-username"
                      name="login-username"
                      placeholder="Tên đăng nhập"
                      :class="{
                        'is-invalid': v$.username.$errors.length,
                      }"
                      v-model="state.username"
                      @blur="v$.username.$touch"
                      :disabled="state.loading"
                    />
                    <div
                      v-if="v$.username.$errors.length"
                      class="invalid-feedback animated fadeIn"
                    >
                      Vui lòng nhập tên đăng nhập
                    </div>
                  </div>
                  <div class="mb-4">
                    <input
                      type="password"
                      class="form-control form-control-alt form-control-lg"
                      id="login-password"
                      name="login-password"
                      placeholder="Mật khẩu"
                      :class="{
                        'is-invalid': v$.password.$errors.length,
                      }"
                      v-model="state.password"
                      @blur="v$.password.$touch"
                      :disabled="state.loading"
                    />
                    <div
                      v-if="v$.password.$errors.length"
                      class="invalid-feedback animated fadeIn"
                    >
                      Vui lòng nhập mật khẩu
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        value=""
                        id="login-remember"
                        name="login-remember"
                        v-model="state.rememberMe"
                        :disabled="state.loading"
                      />
                      <label class="form-check-label" for="login-remember">Nhớ tôi</label>
                    </div>
                  </div>
                </div>
                
                <div class="row mb-4">
                  <div class="col-md-6 col-xl-5">
                    <button type="submit" class="btn btn-primary">
                      <i v-if="state.loading" class="fa fa-fw fa-circle-notch fa-spin me-1"></i>
                      <i v-else class="fa fa-fw fa-sign-in-alt me-1"></i>
                      {{ state.loading ? 'Đăng nhập' : 'Đăng nhập' }}
                    </button>
                  </div>
                </div>
              </form>
              <!-- END Sign In Form -->
            </div>
          </BaseBlock>
          <!-- END Sign In Block -->
        </div>
      </div>
      <div class="fs-sm text-muted text-center">
        <strong>{{ store.app.name + " " + store.app.version }}</strong> &copy;
        {{ store.app.copyright }}
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useAuthStore } from "@/stores/auth.store";
import Swal from 'sweetalert2';

// Vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

// Types and interfaces
interface LoginState {
  username: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
}

// Main store and Router
const store = useTemplateStore();
const router = useRouter();
const authStore = useAuthStore();

// Input state variables
const state = reactive<LoginState>({
  username: '',
  password: '',
  rememberMe: false,
  loading: false
});

// Validation rules
const rules = computed(() => ({
  username: { required, minLength: minLength(2) },
  password: { required, minLength: minLength(1) },
}));

// Use vuelidate
const v$ = useVuelidate(rules, state);

// On form submission
async function onSubmit(): Promise<void> {
  const result = await v$.value.$validate();

  if (!result) return;

  state.loading = true;
  try {
    // Sử dụng store để login thay vì gọi trực tiếp service
    await authStore.login({
      username: state.username,
      password: state.password
    });
    
    // Lưu thông tin đăng nhập nếu Remember Me được chọn
    if (state.rememberMe) {
      localStorage.setItem('rememberedUsername', state.username);
      localStorage.setItem('rememberedPassword', state.password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    }

    // Chuyển hướng đến dashboard
    await router.replace('/backend/dashboard');

  } catch (error: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Đăng nhập thất bại',
      text: error.response?.data?.message || error.message,
    });
  } finally {
    state.loading = false;
  }
}

// Kiểm tra và điền thông tin đăng nhập đã lưu
onMounted((): void => {
  const rememberedUsername = localStorage.getItem('rememberedUsername');
  const rememberedPassword = localStorage.getItem('rememberedPassword');
  const rememberMe = localStorage.getItem('rememberMe');
  
  if (rememberedUsername) {
    state.username = rememberedUsername;
    state.rememberMe = rememberMe === 'true';
    state.password = rememberedPassword || '';
  } else {
    state.username = '';
    state.rememberMe = false;
    state.password = '';
  }
});
</script>