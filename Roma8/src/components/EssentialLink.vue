
<template>
  <div>
    <div v-for="key in Object.keys(conff)" :key="key">
      <div v-if="key === title">
        <q-item
          class="menu"
          clickable
          @click="navigateTo"
          v-if="
            conff[key].activo &&
            (key !== 'Configuracion' ||
              (key === 'Configuracion' && rolDB?.admin))
          "
          :style="{
            backgroundColor: isActiveRoute(link)
              ? userColors?.Diseño?.color
              : '',
          }"
          text-color="black"
          label
        >
          <q-item-section v-if="icon" avatar>
            <q-icon
              :style="{
                color: isActiveRoute(link) ? 'white' : '',
              }"
              :name="icon"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label
            class="lista"
              :style="{
                color: isActiveRoute(link) ? 'white' : '',
              }"
            >
              <!-- Utiliza clases de Quasar para personalizar el color de fondo y el texto del botón -->
              {{ title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "#",
    },

    icon: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const router = useRouter();
    const conff = ref({});
    const store = useStore();
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const cargarConfiguracion = async () => {
      let co = await store.dispatch("authModule/loadConfiguration");

      conff.value = co;
    };
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const isActiveRoute = (routeTitle) => {
      return router.currentRoute.value.name === routeTitle;
    };
    onMounted(() => {
      cargarConfiguracion();
    });

    return {
      navigateTo() {
        if (props.link.startsWith("http")) {
          window.open(props.link, "_blank");
        } else {
          router.push({ name: props.link });
        }
      },
      conff,
      userColors,
      isActiveRoute,
      rolDB,
    };
  },
});
</script>

<style scoped>
</style>