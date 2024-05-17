<template>
  <div class="config-panel">
    <q-btn
      color="inherit"
      :style="{
        backgroundColor: userColors?.Diseño?.color,
      }"
      icon="arrow_back"
      class="buttonback"
      @click="$router.push({ name: 'admin-page' })"
    />
    <h1 class="h1withbutton3">
      Secciones <br />
      del Menu
    </h1>
    <div class="config-panel">
      <div class="module-checkboxes carduser">
        <div
          class="module-checkbox"
          v-for="nombre in Object.keys(modules)"
          :key="nombre"
        >
          <q-checkbox
            type="checkbox"
            :id="nombre"
            v-model="modules[nombre].activo"
          />
          <label :for="nombre" class="module-checkbox__label">{{
            nombre
          }}</label>
        </div>
      </div>
    </div>
    <div style="float: right">
      <q-btn
        color="inherit"
        :style="{
          backgroundColor: userColors?.Diseño?.color,
        }"
        class="q-ml-right"
        @click="saveConfiguration"
        >Guardar Configuración</q-btn
      >
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "AdminConf",
  setup() {
    const store = useStore();
    const modules = ref({
      Noticias: { activo: true },
      Sugerencias: { activo: true },
      Reuniones: { activo: true },
      Incidencias: { activo: true },
      Actas: { activo: true },
      Votaciones: { activo: true },
      Archivos: { activo: true },
      Espacios: { activo: true },
      CerrarSesion: { activo: true },
      Configuracion: { activo: true },
      Perfil: { activo: true },
      Proveedores: { activo: true },
    });
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const loadConfiguration = async () => {
      modules.value = await store.dispatch("authModule/loadConfiguration");
      console.log(modules.value);
    };

    const saveConfiguration = () => {
      store.dispatch("authModule/saveConfiguration", modules.value);
    };

    onMounted(() => {
      loadConfiguration();
    });

    return {
      modules,
      saveConfiguration,
      userColors,
    };
  },
};
</script>

<style scoped>
.config-panel {
  margin: 20px;
}

.module-checkboxes {
  display: flex;
  flex-direction: column; /* Alinea los elementos verticalmente */
}

.module-checkbox {
  display: flex;
  align-items: center;
}

.module-checkbox__input {
  margin-right: 5px;
}

.module-checkbox__label {
  cursor: pointer;
  font-size: 1.1rem; /* Tamaño de letra aumentado */
}

.q-btn {
  margin-top: 20px;
}
</style>
