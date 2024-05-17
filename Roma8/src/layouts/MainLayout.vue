<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header-container">
      <q-toolbar
        class="q-pa-lg q-gutter-x-md q-mt-lg justify-content-between align-items-center"
      >
        <q-avatar size="56px" class="q-mb-sm">
          <img :src="userColors?.icono?.color" />
        </q-avatar>
        <q-toolbar-title> Bienvenido, {{ username }} </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          class="q-ml-md"
          icon="menu"
          aria-label="Menu"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
      <q-img
        :src="userColors?.banner?.color"
        class="header-image absolute-top"
      ></q-img>
    </q-header>
    <q-drawer
      side="right"
      v-model="drawerRight"
      show-if-above
      :breakpoint="2000"
      bordered
    >
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list class="list">
          <EssentialLink
            v-for="link in linksList"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
        <div class="footer">
          <p style="font-size: 12px">
            <q-icon name="copyright" size="25px" color="grey" /> ARESS
            DESARROLLO ESTRATEGICO DE TRANSFORMACION DIGITAL
          </p>
          <p>Hecho por Davit Costa y Alberto Villegas</p>
        </div>
      </q-scroll-area>
      <q-img
        class="absolute-top"
        :src="userColors?.fondo?.color"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-btn
            color="primary"
            :style="{
              float: 'right',
            }"
          >
            <q-icon name="info" />
            <q-tooltip>
              Si usted no le llega los datos actualizados, muevase a otra
              pantalla de la aplicación y vuelva a su pantalla</q-tooltip
            >
          </q-btn>
          <q-avatar size="56px" class="q-mb-sm">
            <img :src="user.photo" />
          </q-avatar>
          <div class="text-weight-bold">{{ user.name }} {{ user.surname }}</div>
          <div>{{ user.email }}</div>
        </div>
      </q-img>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { linksList } from "../router/links-list";
import EssentialLink from "components/EssentialLink.vue";
import useAuth from "src/modules/auth/composables/useAuth";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },
  setup() {
    const store = useStore();
    const drawerRight = ref(false);
    const user = ref({});
    const { username, logout, loadUsersById } = useAuth();
    const router = useRouter();
    const routeParams = router.currentRoute.value.params;
    const userId = routeParams.id;
    const rolDB = ref({});
    const conff = ref({});
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const primaryColor = computed(() => userColors?.value?.Diseño?.color);

    const onLogout = () => {
      logout();
    };

    const loadUserInfo = async () => {
      try {
        await store.dispatch("authModule/loadUsers3");

        const userData = await loadUsersById(userId);
        user.value = userData;
        const rol = computed(() => store.getters["authModule/getRolDB"]);
        rolDB.value = rol.value;
        const conf = computed(() => store.getters["authModule/getConf"]);
        conff.value = conf.value;
      } catch (error) {
        console.error("Error al cargar la información del usuario:", error);
      }
    };

    const filteredLinks = computed(() => {
      return linksList.filter((link) => {
        // Utiliza el nombre del enlace para buscar el estado correspondiente en la configuración
        return conf.value[link.title.toLowerCase()].activo;
      });
    });

    const fetchColorsFromDatabase = async () => {
      try {
        await store.dispatch("authModule/getColorsFromDatabase");
      } catch (error) {
        console.error(
          "Error al recuperar los colores de la base de datos:",
          error
        );
      }
    };

    const injectStyles = () => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `:root { --q-primary: ${primaryColor.value}; }`;
      document.head.appendChild(styleElement);
    };

    const saveColorsToLocalStorage = () => {
      localStorage.setItem("userColors", JSON.stringify(userColors.value));
    };

    const loadColorsFromLocalStorage = () => {
      const savedColors = localStorage.getItem("userColors");
    };

    watch(userColors, () => {
      saveColorsToLocalStorage();
      injectStyles();
    });

    const onProfile = () => {
      router.push({
        name: "profile-page",
        params: {
          id: userId,
        },
      });
    };

    const onAdmin = () => {
      router.push({
        name: "admin-page",
        params: {
          id: userId,
        },
      });
    };

    onMounted(async () => {
      await loadUserInfo();
      await fetchColorsFromDatabase();
      loadColorsFromLocalStorage();
      injectStyles();
      console.log("diamantes", userColors?.value.Diseño?.color);
    });

    return {
      user,
      linksList,
      username,
      loadUsersById,
      onLogout,
      onAdmin,
      onProfile,
      rolDB,
      filteredLinks,
      userColors,
      drawerRight,
      toggleRightDrawer() {
        drawerRight.value = !drawerRight.value;
      },
    };
  },
});
</script>

<style lang="css" scoped>
.header-container {
  display: flex;
  flex-wrap: wrap;
}

.header-buttons {
  display: flex;
}

.header-image {
  height: 100%;
  z-index: -1;
  opacity: 0.2;
  filter: grayscale(100%);
}

.list {
  padding-top: 10px;
  padding-left: 10px;
}

.footer {
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  text-align: center;
}

.footer-p {
  font-size: 10px;
  color: #666;
}

.text-container {
  flex-direction: row;
  display: flex;
}
</style>