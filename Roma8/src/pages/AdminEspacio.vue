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
    <h1 class="h1withbutton">Espacios</h1>
    <div class="q-gutter-md">
      <!-- Sección de Crear/Editar Espacio -->
      <q-card class="q-mb-md carduser">
        <q-card-section>
          <h2 v-if="!editingSpace" class="text-h6">Crear Espacio</h2>
          <h2 v-if="editingSpace" class="text-h6">Editar Espacio</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="spaceName" hint="Nombre del Espacio" />
          <q-input v-model="capacity" hint="Capacidad" />
          <q-input v-model="schedule" hint="Horario" />
          <!-- Agregado para seleccionar imagen -->
          <q-input v-model="price" hint="Precio" />
          <input
            type="file"
            @change="handleImageUpload"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="!editingSpace"
            :disable="spaceName.trim() === ''"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Crear"
            @click="saveSpace"
          />
          <q-btn
            v-if="editingSpace"
            :disable="spaceName.trim() === ''"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Guardar"
            @click="updateSpace"
          />
          <q-btn
            v-if="editingSpace"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Cancelar"
            @click="cancel"
          />
        </q-card-actions>
      </q-card>

      <div class="spaces-list">
        <h2 class="text-h6">Lista de Espacios</h2>
        <div
          v-for="(space, spaceName) in spaces"
          :key="spaceName"
          class="space carduser"
        >
          <div class="space-info">
            <h3>{{ spaceName }}</h3>
            <ul>
              <li><strong>Capacidad:</strong> {{ space.plazas }}</li>
              <li><strong>Horario:</strong> {{ space.horario }}</li>
              <li><strong>Precio:</strong> {{ space.precio }}</li>
              <li>
                <strong>Imagen:</strong>
                <img
                  :src="space.imagen"
                  alt="Imagen del Espacio"
                  style="max-width: 50%"
                />
              </li>
            </ul>
            <div style="display: flex; justify-content: flex-end">
              <q-btn
                color="inherit"
                :style="{
                  backgroundColor: userColors?.Diseño?.color,
                  margin: '5px',
                }"
                label="Editar"
                @click="editSpace(space, spaceName)"
              />
              <q-btn
                color="inherit"
                :style="{
                  backgroundColor: userColors?.Diseño?.color,
                  margin: '5px',
                }"
                label="Eliminar"
                @click="deleteSpace(spaceName)"
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
import { storage } from "../boot/firebase";
import firebase from "firebase/compat/app";

export default {
  name: "AdminConfig",
  setup() {
    const spaceName = ref("");
    const capacity = ref("");
    const schedule = ref("");
    const image = ref(""); // Added to store image URL
    const price = ref("");
    const editingSpace = ref(false);
    const oldSpaceName = ref("");
    const spaces = ref([]);
    const store = useStore();
    let storageRef = storage.ref();
    const error = ref("");
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const handleImageUpload = (event) => {
      image.value = event.target.files[0];
      console.log(image.value);
    };

    const addDataImageDB = async () => {
      try {
        console.log("san pedro ", image.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("espacios")
          .child(image.value.name)
          .put(image.value);

        const urlDescarga = await storageRef
          .child("espacios")
          .child(image.value.name)
          .getDownloadURL();

        // Actualiza el valor de error con un mensaje de éxito
        error.value = "Imagen subida con éxito";
        image.value = null;
        return urlDescarga;
      } catch (error) {
        console.log(error);
        // Si hay un error, actualiza el valor de error con el mensaje de error
        error.value = "Error al subir la imagen: " + error.message;
      }
    };

    const saveSpace = async () => {
      let imagenurl = await addDataImageDB();
      console.log(imagenurl);
      const payload = {
        spaceName: spaceName.value,
        space: {
          plazas: capacity.value,
          horario: schedule.value,
          imagen: imagenurl, // Utilizar la URL de la imagen
          precio: price.value,
        },
      };
      await store.dispatch("authModule/saveSpace", payload);
      //window.location.reload();
      getSpaces();
    };

    const getSpaces = async () => {
      spaces.value = await store.dispatch("authModule/getSpacesFromDatabase");
    };

    const deleteSpace = async (spaceName) => {
      try {
        await store.dispatch("authModule/deleteSpace", spaceName);
        // Update the spaces list after deleting one
        await getSpaces();
      } catch (error) {
        console.error("Error deleting space:", error);
      }
    };

    const editSpace = (space, spaceName2) => {
      // Fill form fields with space details
      spaceName.value = spaceName2;
      capacity.value = space.plazas;
      schedule.value = space.horario;
      image.value = space.imagen; // Assign image URL
      price.value = space.precio;

      // Enable edit mode
      editingSpace.value = true;

      // Save old space name in case editing is canceled
      oldSpaceName.value = spaceName2;
    };

    const cancel = () => {
      // Restore original values
      spaceName.value = oldSpaceName.value;
      capacity.value = "";
      schedule.value = "";
      image.value = "";
      price.value = "";

      // Disable edit mode
      editingSpace.value = false;
    };

    const updateSpace = async () => {
      // Build object with updated space details
      let imagenurl = await addDataImageDB();
      const updatedSpace = {
        oldSpace: oldSpaceName.value,
        spaceName: spaceName.value,
        space: {
          plazas: capacity.value,
          horario: schedule.value,
          imagen: imagenurl, // Utilizar la URL de la imagen
          precio: price.value,
        },
      };

      try {
        // Call action to update space in database
        await store.dispatch("authModule/updateSpace", updatedSpace);

        // Disable edit mode and reset values
        editingSpace.value = false;
        oldSpaceName.value = "";
        spaceName.value = "";
        capacity.value = "";
        schedule.value = "";
        image.value = "";
        price.value = "";

        // Update spaces list
        await getSpaces();
      } catch (error) {
        console.error("Error updating space:", error);
      }
    };

    onMounted(() => {
      getSpaces();
    });

    return {
      spaceName,
      capacity,
      schedule,
      image,
      price,
      spaces,
      editingSpace,
      oldSpaceName,
      saveSpace,
      getSpaces,
      deleteSpace,
      editSpace,
      cancel,
      updateSpace,
      handleImageUpload, // Add function for handling image upload
      addDataImageDB,
      error,
      userColors,
    };
  },
};
</script>

<style>
.spaces-list {
  margin-top: 20px;
}
.space {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
.space-info {
  flex: 1;
}
.space-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>