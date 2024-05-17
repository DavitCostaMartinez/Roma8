<template>
  <div class="q-pa-md">
    <q-btn color="inherit" :style="{ backgroundColor: userColors?.Diseño?.color }" icon="arrow_back" @click="goBack"
      class="buttonback" />
    <h1 class="h1withbutton">Incidencias</h1>
    <template v-if="$route.name === 'incidents-list'">
      <div class="d-flex justify-between">
        <q-btn v-if="rolDB?.incidencias?.crear" label="Nuevo" type="submit" icon="add_circle" padding="12px 20px"
          @click="$router.push({ name: 'new-incident' })" class="q-mr-md" color="inherit"
          :style="{ backgroundColor: userColors?.Diseño?.color }" style="border-radius: 30px" />
      </div>
      <br />
      <q-table flat bordered title="Incidencias" :rows="incidents" :columns="columns"
        no-data-label="No hay incidencias en este momento" table-header-class="text-black" :table-class="rowClass"
        selection="single" row-key="id" :style="{ border: 'solid 3px ' + userColors?.Diseño?.color }"
        v-model:selected="selected" />
    </template>
    <router-view v-else />

    <q-infinite-scroll @load="onLoad" :offset="250">
      <q-dialog v-model="card" @show="loadIncidentState" persistent>
        <q-card class="my-card">
          <q-img v-if="selectedIncident.photo" :src="selectedIncident.photo" alt="Descripción de la imagen"
            style="max-width: 100%; max-height: 100%" />
          <q-card-section class="q-pa-md">
            <div class="row no-wrap items-center">
              <div class="col text-h6 q-mb-sm">
                {{ selectedIncident.title }}
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none" style="max-height: 120px; overflow-y: visible">
            <div class="row d-flex no-wrap align-center">
              <q-icon name="description" class="fs-22" style="margin-right: 10px" />
              {{ selectedIncident.description }}
            </div>
            <br />
            <div class="row d-flex no-wrap align-center">
              <q-icon name="event" class="fs-22" style="margin-right: 10px" />
              {{ formatDateShort(selectedIncident.date) }}
            </div>
            <br />
            <div class="row d-flex no-wrap align-left">
              <q-icon name="person" class="fs-22" style="margin-right: 10px" />
              Realizado por {{ selectedIncident.name }}
            </div>
            <br />
            <q-select outlined v-model="model" :options="options" label="Estado" />
            <br />
            <q-separator />
            <q-card-actions align="right">
              <q-btn v-close-popup flat style="font-weight: bold; flex-direction: flex-end" dense color="primary"
                label="SALIR" @click="handleCloseCard" />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-infinite-scroll>
  </div>
</template>

<script>
import useIncident from "src/modules/incident/composables/useIncident";
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "IncidentList",
  setup() {
    const store = useStore();
    const selected = ref([]);
    const incidents = ref([]);
    const columns = ref([]);
    const isOpen = ref(false);
    const { loadIncidentsDB, createIncidentState, updateIncidentStateDB } =
      useIncident();
    const card = ref(false);
    const model = ref("");
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const incidentsState = computed(
      () => store.getters["incidentModule/getIncidents"]
    );
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const loadIncidentInfo = async () => {
      const loadedIncidents = await loadIncidentsDB();

      if (incidents.value.length > 0 && loadedIncidents.length > 0) {
        columns.value = [
          ...Object.keys(incidents.value[0]).map((key) => {
            if (key === "title") {
              return {
                name: key,
                label: "Titulo",
                field: key,
                sortable: true,
                align: "left",
                style: function (key) {
                  if (key.state === "Abierta") {
                    return "color: red; margin: 0px; width: 50px;"; // Estilo para estado "Abierta" con margen derecho de 0px
                  } else {
                    return "color: green; margin: 0px; width: 50px;"; // Estilo para estado diferente a "Abierta" con margen derecho de 0px
                  }
                },
              };
            } else if (key === "state") {
              return {
                name: key,
                label: "Estado",
                field: function (key) {
                  if (key.state === "Abierta") {
                    return "Abierta";
                  } else {
                    return "Resuelta";
                  }
                },
                align: "left",
                sortable: true,
                style: function (key) {
                  if (key.state === "Abierta") {
                    return "color: red;"; // Color para estado Abierta
                  } else {
                    return "color: green;"; // Color para estado Resuelta
                  }
                },
              };
            } else if (
              key === "id" ||
              key === "idUser" ||
              key === "photo" ||
              key === "description" ||
              key === "date" ||
              key === "name" ||
              key === "type"
            ) {
              return {};
            } else {
              return {
                name: key,
                label: key.charAt(0).toString() + key.slice(1),
                field: key,
                sortable: true,
                align: "left",
              };
            }
          }),
        ];
        columns.value.unshift(columns.value.pop());
      }
    };

    onMounted(async () => {
      await loadIncidentInfo();
    });

    watch(selected, (newValue) => {
      card.value = newValue.length > 0;
    });

    watch(incidentsState, (newIncidents) => {
      incidents.value = newIncidents.filter(
        (incident) => incident.idUser === userState.value.id
      );
    });

    const formatDateShort = (dateNewscast) => {
      const date = new Date(dateNewscast);
      return date.toLocaleString();
    };

    const selectedIncident = computed(() => {
      if (selected.value.length === 0) {
        return null;
      } else {
        const incidents = JSON.parse(JSON.stringify(selected.value));
        console.log("La incidencia seleccionada es: ", incidents[0]);
        return incidents[0];
      }
    });

    const handleCloseCard = async () => {
      await updateStateIncident();
      selected.value = [];
      await loadIncidentInfo();
    };

    const updateStateIncident = async () => {
      if (model.value === "Resuelta") {
        selectedIncident.value.state = "Resuelta";
        await updateIncidentStateDB(selectedIncident.value);
      }
    };

    const loadIncidentState = () => {
      model.value = selectedIncident.value.state;
      createIncidentState(selectedIncident.value);
    };

    const goBack = () => {
      history.back();
    };

    return {
      selected,
      columns,
      rolDB,
      card,
      incidents,
      loadIncidentInfo,
      selectedIncident,
      isOpen,
      handleCloseCard,
      loadIncidentState,
      updateStateIncident,
      userColors,
      model,
      options: ["Abierta", "Resuelta"],
      formatDateShort,
      goBack,
    };
  },
});
</script>

<style scoped>
.body-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 25px;
}

.body-container p {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  text-align: center;
}

.footer {
  text-align: center;
  margin-top: 20px;
}

.my-card {
  width: 100%;
}

.text-header {
  padding: 12px;
  font-size: 40px;
  text-align: center;
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-footer {
  padding: 10px 20px;
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.button-footer:hover {
  background-color: #e04246;
}

.photo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>