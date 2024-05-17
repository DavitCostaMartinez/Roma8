<template>
  <div class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{ backgroundColor: userColors?.Diseño?.color }"
      icon="arrow_back"
      @click="goBack"
      class="buttonback"
    />
    <h1 class="h1withbutton">Sugerencias</h1>
    <template v-if="$route.name === 'suggestions-list'">
      <div class="d-flex justify-between">
        <q-btn
          v-if="rolDB?.sugerencias?.crear"
          label="Nuevo"
          type="submit"
          color="inherit"
          :style="{ backgroundColor: userColors?.Diseño?.color }"
          icon="add_circle"
          padding="12px 20px"
          @click="$router.push({ name: 'new-suggestion' })"
          class="q-mr-md"
          style="border-radius: 30px"
        />
      </div>
      <br />
      <q-table
        flat
        bordered
        title="Sugerencias"
        :rows="suggestions"
        :columns="columns"
        no-data-label="No hay sugerencias en este momento"
        selection="single"
        row-key="id"
        :style="{ border: 'solid 3px ' + userColors?.Diseño?.color }"
        v-model:selected="selected"
      />
    </template>
    <q-infinite-scroll @load="onLoad" :offset="250">
      <q-dialog v-model="card" @show="loadSuggestionState" persistent>
        <q-card class="my-card">
          <q-img
            v-if="selectedSuggestion.photo"
            :src="selectedSuggestion.photo"
            alt="Descripción de la imagen"
            style="max-width: 100%; max-height: 100%"
          />
          <q-card-section class="q-pa-md">
            <div class="row no-wrap items-center">
              <div
                class="col text-h6 q-mt-sm q-mb-xs"
                style="overflow-wrap: break-word"
              >
                {{ selectedSuggestion.title }}
              </div>
            </div>
          </q-card-section>
          <q-card-section
            class="q-pt-none"
            style="max-height: 120px; overflow-y: visible"
          >
            <div class="text-subtitle1">
              {{ selectedSuggestion.description }}
            </div>
            <br />
            <div class="row d-flex no-wrap align-center">
              <q-icon name="event" class="fs-22" style="margin-right: 10px" />
              {{ formatDateShort(selectedSuggestion.date) }}
            </div>
            <q-separator />
            <q-card-actions align="right">
              <q-btn
                v-close-popup
                flat
                style="font-weight: bold; flex-direction: flex-end"
                dense
                color="primary"
                label="SALIR"
                @click="handleCloseCard"
              />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-infinite-scroll>
  </div>
</template>


<script>
import useSuggestion from "src/modules/suggestions/composables/useSuggestion";
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "SuggestionsList",
  setup() {
    const selected = ref([]);
    const suggestions = ref([]);
    const columns = ref([]);
    const isOpen = ref(false);
    const { loadSuggestionsDB, createSuggestionState } = useSuggestion();
    const card = ref(false);
    const store = useStore();
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const suggestionsState = computed(
      () => store.getters["suggestionModule/getSuggestions"]
    );
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);

    const loadSuggestionInfo = async () => {
      const loadedSuggestions = await loadSuggestionsDB();

      if (suggestions.value.length > 0 && loadedSuggestions.length > 0) {
        columns.value = [
          ...Object.keys(suggestions.value[0]).map((key) => {
            if (key === "name") {
              return {
                name: key,
                label: "Usuario",
                field: key,
                sortable: true,
                align: "left",
              };
            } else if (key === "title") {
              return {
                name: key,
                label: "Titulo",
                field: key,
                sortable: true,
                align: "left",
              };
            } else if (
              key === "idUser" ||
              key === "id" ||
              key === "photo" ||
              key === "description" ||
              key === "date"
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
      await loadSuggestionInfo();
    });

    watch(selected, (newValue) => {
      card.value = newValue.length > 0;
    });

    watch(suggestionsState, (newSuggestions) => {
      suggestions.value = newSuggestions.filter(
        (suggestion) => suggestion.idUser === userState.value.id
      );
    });

    const selectedSuggestion = computed(() => {
      if (selected.value.length === 0) {
        return null;
      } else {
        const suggestions = JSON.parse(JSON.stringify(selected.value));
        console.log("La sugerencia seleccionada es: ", suggestions[0]);
        return suggestions[0];
      }
    });

    const handleCloseCard = async () => {
      selected.value = [];
    };

    const loadSuggestionState = () => {
      createSuggestionState(selectedSuggestion.value);
    };

    const formatDateShort = (dateNewscast) => {
      const date = new Date(dateNewscast);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
       const goBack = () => {
      history.back();
    };

    return {
      selected,
      columns,
      card,
      rolDB,
      suggestions,
      loadSuggestionInfo,
      selectedSuggestion,
      isOpen,
      handleCloseCard,
      loadSuggestionState,
      userColors,
      formatDateShort,
      goBack
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