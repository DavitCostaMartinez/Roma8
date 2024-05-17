<template>
  <q-page class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{
        backgroundColor: userColors?.Diseño?.color,
      }"
      icon="arrow_back"
      class="buttonback"
      @click="$router.push({ name: 'admin-page' })"
    />
    <h1 class="h1withbutton">Usuarios</h1>
    <div class="q-gutter-md">
      <q-card class="q-mb-md carduser">
        <q-card-section>
          <h2 class="text-h6">Crear Usuario</h2>
        </q-card-section>

        <q-card-section>
          <!-- Nombre de Usuario -->
          <q-input v-model="newUser.name" label="Nombre de Usuario" outlined />

          <!-- Apellidos -->
          <q-input v-model="newUser.surname" label="Apellidos" outlined />

          <!-- Rol (Seleccionar vacío por ahora) -->
          <q-select
            v-model="selectedRole"
            :options="roles"
            label="Rol"
            outlined
          />

          <!-- Teléfono -->
          <q-input v-model="newUser.phone" label="Teléfono" outlined />

          <!-- Correo Electrónico -->
          <q-input
            v-model="newUser.email"
            label="Correo Electrónico"
            outlined
          />

          <!-- Contraseña -->
          <q-input
            v-model="newUser.password"
            label="Contraseña"
            type="password"
            outlined
          />
          <q-select
            v-model="selectedHousing"
            :options="housings"
            label="Vivienda"
            outlined
          />
          <!-- Checkbox Admin de Finca -->
          <q-checkbox v-model="newUser.adminproperty" label="Admin de Finca" />

          <!-- Select de Viviendas --> 
          
          <!-- Botón para crear el usuario -->
          <div
            class="q-gutter-md"
            style="display: flex; justify-content: flex-end"
          >
            <q-btn
              color="inherit"
              :disable="isButtonDisabled"
              :style="{
                backgroundColor: userColors?.Diseño?.color,
              }"
              label="Crear Usuario"
              @click="createUser"
            />
            <q-btn
              color="inherit"
              :style="{
                backgroundColor: userColors?.Diseño?.color,
              }"
              label="Cancelar"
              @click="cancelForm"
            />
          </div>
        </q-card-section>
      </q-card>

      <div class="users-list">
        <h2 class="text-h6">Lista de Usuarios</h2>
        <div
          v-for="(user, index) in users"
          :key="index"
          class="user carduser"
          style="margin: 15px"
        >
          <div class="user-info">
            <div class="user-details">
              <h3>{{ user.name }} {{ user.surname }}</h3>
              <p><strong>Rol:</strong> {{ user.role }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Teléfono:</strong> {{ user.phone }}</p>
              <p><strong>Vivienda:</strong> {{ user.house }}</p>
              <p>
                <strong>Admin de Finca:</strong>
                {{ user.adminproperty ? "Sí" : "No" }}
              </p>
            </div>
            <div
              class="user-actions"
              style="display: flex; justify-content: flex-end"
            >
              <q-btn
                color="inherit"
                :style="{
                  backgroundColor: userColors?.Diseño?.color,
                  margin: '5px',
                }"
                label="Eliminar"
                @click="deletUser(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import CryptoJS from "crypto-js";
//import { functions } from "../boot/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
//import { httpsCallable } from "firebase/functions"
import useAuth from "../modules/auth/composables/useAuth";

export default {
  name: "AdminHousing",
  setup() {
    const router = useRouter();
    const roles = ref([]);
    const selectedRole = ref("");
    const selectedHousing = ref("");
    const newUser = ref({
      name: "",
      surname: "",
      role: selectedRole,
      house: selectedHousing,
      phone: "",
      email: "",
      password: "",
      adminproperty: false,
      photo:
        "https://firebasestorage.googleapis.com/v0/b/roma8-4d32f.appspot.com/o/imagenes%2Fdefault.png?alt=media&token=65549a7b-c886-4d24-bdb8-451485cfa9e7",
    });
    const users = ref([]);
    const housings = ref([]);
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const store = useStore();
    const { deleteUserById } = useAuth();

    const getRoles = async () => {
      try {
        const rolesFromAPI = await store.dispatch(
          "authModule/getRolesFromDatabase"
        );
        if (rolesFromAPI && typeof rolesFromAPI === "object") {
          roles.value = Object.keys(rolesFromAPI);
        } else {
          console.error("API response is not in the expected format");
        }
      } catch (error) {
        console.error("Error getting roles:", error);
      }
    };

    const getHousings = async () => {
      try {
        let house = await store.dispatch("authModule/getHousingsFromDatabase");
        if (house && typeof house === "object") {
          housings.value = Object.keys(house);
        } else {
          console.error("API response is not in the expected format");
        }
      } catch (error) {
        console.error("Error getting housings:", error);
      }
    };

    const isButtonDisabled = computed(() => {
      return (
        newUser.value.name.trim() === "" ||
        newUser.value.surname.trim() === "" ||
        selectedRole.value === null ||
        newUser.value.phone.trim() === "" ||
        newUser.value.email.trim() === "" ||
        newUser.value.password.trim() === "" ||
        selectedHousing.value === null
      );
    });

    onMounted(() => {
      getRoles();
      getHousings();
      getUsers();
    });

    const getUsers = async () => {
      users.value = await store.dispatch("authModule/getUsersFromDatabase");
    };

    const deletUser = async (id) => {
      try {
        await deleteUserById(id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };

    const authUser = ref({
      email: newUser.value.email,
      password: newUser.value.password,
    });

    const createUser = async ({ commit }) => {
      try {
        authUser.value.email = newUser.value.email;
        authUser.value.password = newUser.value.password;
        console.log(authUser.value.password);
        const md5Password = CryptoJS.MD5(newUser.value.password).toString();
        newUser.value.password = md5Password;

        const authInstance = getAuth();
        createUserWithEmailAndPassword(
          authInstance,
          authUser.value.email,
          authUser.value.password
        )
          .then((userCredential) => {
            const user = userCredential.user;
          })
          .catch((error) => {
            const errorCode = error.code;
            console.log(errorCode);
            const errorMessage = error.message;
            console.log(errorMessage);
          });

        await store.dispatch("authModule/createUser2", {
          user: newUser.value,
        });

        newUser.value = {
          name: "",
          surname: "",
          role: "",
          house: "",
          phone: "",
          email: "",
          password: "",
          adminproperty: false,
        };
        await getUsers();
      } catch (error) {
        console.error("Error creating user:", error);
      }
    };

    const cancelForm = () => {
      newUser.value = {
        name: "",
        surname: "",
        role: "",
        house: "",
        phone: "",
        email: "",
        password: "",
        adminproperty: false,
      };
      selectedHousing.value = "";
    };

    return {
      newUser,
      createUser,
      roles,
      selectedRole,
      cancelForm,
      authUser,
      users,
      deletUser,
      userColors,
      housings,
      selectedHousing,
      router,
      isButtonDisabled,
    };
  },
};
</script>