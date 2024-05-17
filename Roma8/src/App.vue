<template>
  <div>
    <div v-if="authStatus === 'authenticating'" class="loading-overlay">
      <!-- Aquí puedes agregar tu GIF de pantalla de carga -->
      <q-spinner-gears size="300px" color="primary" />
    </div>
    <router-view />
  </div>
</template>


<script>
import { defineComponent } from "vue";
import useAuth from "./modules/auth/composables/useAuth";
import { storage } from "./boot/firebase";

export default defineComponent({
  name: "App",
  setup() {
    const { authStatus, checkAuthentication } = useAuth();
    checkAuthentication();
    const storageRef = storage.ref();

    return {
      authStatus,
      storageRef
    };
  },
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.5); /* Fondo semitransparente */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>