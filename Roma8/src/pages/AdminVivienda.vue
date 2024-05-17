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
    <h1 class="h1withbutton">Viviendas</h1>
    <div class="q-gutter-md">
      <q-card class="q-mb-md carduser">
        <q-card-section>
          <h2 class="text-h6">Crear Vivienda</h2>
        </q-card-section>

        <q-card-section>
          <!-- Escalera -->
          <q-input v-model="newHousing.stair" label="Escalera" outlined />

          <!-- Piso -->
          <q-input v-model="newHousing.floor" label="Planta" outlined />

          <q-input
            v-model="newHousing.n_door"
            label="Número de Puerta"
            outlined
          />

          <!-- Checkbox Admin de Finca -->
          <q-checkbox
            v-model="newHousing.adminproperty"
            label="Admin de Finca"
          />
          <!-- Botón para crear la vivienda -->
          <div class="q-gutter-md" align="right">
            <q-btn
              color="inherit"
              :style="{
                backgroundColor: userColors?.Diseño?.color,
              }"
              label="Crear Vivienda"
              @click="createHousing"
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
        <h2 class="text-h6">Lista de Viviendas</h2>
        <div
          v-for="(housing, index) in housings"
          :key="index"
          class="housing carduser"
          style="margin: 15px"
        >
          <div class="housing-info">
            <div class="housing-details">
              <h3 class="text-h6">{{ index }}</h3>
              <p><strong>Escalera:</strong> {{ housing.stair }}</p>
              <p><strong>Planta:</strong> {{ housing.floor }}</p>
              <p><strong>Número de Puerta:</strong> {{ housing.n_door }}</p>
              <p>
                <strong>Admin de Finca:</strong>
                {{ housing.adminproperty ? "Sí" : "No" }}
              </p>
            </div>
            <div
              class="housing-actions"
              style="display: flex; justify-content: flex-end"
            >
              <q-btn
                color="inherit"
                :style="{
                  backgroundColor: userColors?.Diseño?.color,
                  margin: '5px',
                }"
                label="Eliminar"
                @click="deleteHousing(index)"
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
import { useStore } from "vuex";

export default {
  name: "AdminHousing",
  setup() {
    // Variables for form fields
    const newHousing = ref({
      n_door: "",
      stair: "",
      floor: "",
      adminproperty: false,
    });

    const housings = ref([]);
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    // Reference to Vuex store
    const store = useStore();

    // Call getHousings function when the component mounts
    onMounted(() => {
      getHousings();
    });

    // Function to get housings from database
    const getHousings = async () => {
      housings.value = await store.dispatch(
        "authModule/getHousingsFromDatabase"
      );
    };

    // Function to delete a housing
    const deleteHousing = async (housingId) => {
      try {
        await store.dispatch("authModule/deleteHousing", housingId);
        // After deletion, update the housing list
        await getHousings();
      } catch (error) {
        console.error("Error deleting housing:", error);
      }
    };

    // Function to edit a housing
    const editHousing = (housing) => {
      // Implement your logic to edit a housing here
    };

    // Function to create a new housing
    const createHousing = async () => {
      try {
        // Call the 'createHousing' action from Vuex store and pass the newHousing object as an argument
        await store.dispatch("authModule/createHousing", newHousing.value);

        // Clear the form fields after creating the housing
        newHousing.value = {
          n_door: "",
          stair: "",
          floor: "",
          adminproperty: false,
        };

        // Update the list of housings
        await getHousings();
      } catch (error) {
        console.error("Error creating housing:", error);
        // Handle the error as per your requirement
      }
    };

    // Function to clear the form fields
    const cancelForm = () => {
      newHousing.value = {
        n_door: "",
        stair: "",
        floor: "",
        adminproperty: false,
      };
    };

    return {
      // Variables
      newHousing,
      // Functions
      createHousing,
      // Other necessary data
      housings,
      cancelForm,
      deleteHousing,
      editHousing,
      userColors,
    };
  },
};
</script>

<style>
/* Add your styles here */
</style>
