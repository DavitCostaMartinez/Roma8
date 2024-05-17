<template>
  <div>
    <span class="login100-form-title p-b-41"> INICIAR SESIÓN </span>
    <form @submit.prevent="onSubmit" class="login100-form validate-form p-b-33 p-t-5">
      <div class="wrap-input100 validate-input" data-validate="Enter username">
        <input v-model="userForm.email" class="input100" type="email" placeholder="Correo electronico" required />
        <span class="focus-input100" data-placeholder="&#xe82a;"></span>
      </div>

      <div class="wrap-input100 validate-input" data-validate="Enter password"
        style="display: flex; align-items: center;">
        <input v-model="userForm.password" :type="isPwd ? 'password' : 'text'" class="input100" placeholder="Contraseña"
          required>
        <span class="focus-input100" data-placeholder="&#xe80f;"></span>
        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"
          style="display: flex; justify-content: center; padding-right: 30px" size="25px" />
      </div>

      <div class="container-login100-form-btn m-t-30">
        <div>
          <button type="submit" class="login100-form-btn">
            <i class="material-icons">person</i>
            <span style="margin-left: 5px; padding: 8px">INICIAR SESIÓN</span>
          </button>
        </div>
      </div>
      <div class="column justify-center m-t-20">
        <button @click="onForgotPassword">
          <span style="
              display: flex;
              justify-content: center;
              align-items: center;
              text-decoration: underline;
            ">
            ¿Has olvidado la contraseña?
          </span>
        </button>
      </div>
      <template v-if="anyusers">
        <div class="row justify-center m-t-10">
          <button @click="onCreateUserDemo">
            <i class="material-icons">person</i>
            <span style="justify-content: center; display: flex">CREAR USUARIO DEMO</span>
          </button>
        </div>
      </template>
    </form>
  </div>
</template>
<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth.js";
import Swal from "sweetalert2";
import { useStore } from "vuex";

export default {
  name: "loginScreen",
  setup() {
    const { loginUser, createUserDemo } = useAuth();
    const route = useRouter();
    const store = useStore();
    const anyusers = ref(false);

    const userForm = ref({
      id: "",
      email: "",
      password: "",
    });
    const usersArray = ref([]);
    const users = computed(() => store.getters["authModule/getUsers"]);

    onMounted(async () => {
      anyusers.value = await store.dispatch("authModule/loadUsers2");
    });

    return {
      userForm,
      loginUser,
      users,
      usersArray,
      createUserDemo,
      anyusers,
      isPwd: ref(true),
      onSubmit: async (event) => {
        console.log("aaaaa", anyusers.value)
        if (!anyusers.value) {
          const { ok, message } = await loginUser(userForm.value);
          event.preventDefault();

          if (!ok) {
            Swal.fire("Error de submit", message, "error");
          } else {
            try {
              const users = await store.dispatch(
                "authModule/loadUsersByEmail",
                userForm.value.email
              );
              usersArray.value = users;
              console.log("La lista de usuarios es: ", usersArray.value);
            } catch (error) {
              console.error("Error al cargar usuarios:", error);
            }
            route.push({
              name: "news-list",
              params: {
                id: usersArray.value.id,
              },
            });
          }
        }
      },
      onCreateUserDemo: async (event) => {
        const { ok, message } = await createUserDemo();
        anyusers.value = false
        //window.location.reload();
        event.preventDefault()
        if (!ok) {
          Swal.fire("Error", message, "error");
        }
      },
    };
  },
};
</script>