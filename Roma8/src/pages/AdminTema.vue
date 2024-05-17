<template>
  <q-page class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{
        margin: '10px',
        backgroundColor: userColors?.Diseño?.color,
      }"
      icon="arrow_back"
      class="buttonback"
      @click="$router.push({ name: 'admin-page' })"
    />
    <h1 class="h1withbutton3">Diseño <br> de Tema</h1>
    <div class="elements-container">
      <div
        v-for="element in elements"
        :key="element.name"
        class="element-wrapper2"
      >
        <div
          v-if="
            element.name !== 'fondo' &&
            element.name !== 'icono' &&
            element.name !== 'banner'
          "
          class="element-wrapper"
        >
          <h2 class="element-title">{{ element.name }}</h2>
          <div class="element-content">
            <q-color
              v-model="element.color"
              style="width: 100%; margin-bottom: 10px"
            />
            <q-btn
              color="inherit"
              :style="{
                backgroundColor: userColors?.Diseño?.color,
              }"
              @click="saveColor(element)"
              >Guardar Color</q-btn
            >
          </div>
        </div>
      </div>
      <div class="element-wrapper carduser">
        <h2 class="element-title">Imagen de fondo del Menu</h2>
        <div class="element-content">
          <input type="file" @change="handleImageUpload" />
          <q-btn
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            @click="saveImg(element)"
            >Guardar Imagen</q-btn
          >
        </div>
      </div>
      <div class="element-wrapper carduser">
        <h2 class="element-title">Imagen de icono del banner</h2>
        <div class="element-content">
          <input type="file" @change="handleImageUpload2" />
          <q-btn
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            @click="saveImg2(element)"
            >Guardar Imagen</q-btn
          >
        </div>
      </div>
      <div class="element-wrapper carduser">
        <h2 class="element-title">Imagen del Banner</h2>
        <div class="element-content">
          <input type="file" @change="handleImageUpload3" />
          <q-btn
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            @click="saveImg3(element)"
            >Guardar Imagen</q-btn
          >
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
  setup() {
    const store = useStore();
    const elements = ref([]);
    const image = ref("");
    const image2 = ref("");
    const banner = ref("");
    let storageRef = storage.ref();
    const error = ref("");
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const handleImageUpload = (event) => {
      image.value = event.target.files[0];
      console.log(image.value);
    };
    const handleImageUpload2 = (event) => {
      image2.value = event.target.files[0];
    };
    const handleImageUpload3 = (event) => {
      banner.value = event.target.files[0];
    };

    const addDataImageDB = async (image) => {
      try {
        console.log("San Pedro", image.name);
        storageRef = firebase.storage().ref();
        await storageRef.child("imagenes").child(image.name).put(image);

        const urlDescarga = await storageRef
          .child("imagenes")
          .child(image.name)
          .getDownloadURL();

        // Actualiza el valor de error con un mensaje de éxito
        error.value = "Imagen subida con éxito";
        return urlDescarga;
      } catch (error) {
        console.log(error);
        // Si hay un error, actualiza el valor de error con el mensaje de error
        error.value = "Error al subir la imagen: " + error.message;
      }
    };

    // Función para cargar los elementos y convertir los colores a cadenas de texto
    onMounted(async () => {
      try {
        // Llama a la acción Vuex para obtener los colores de la base de datos
        const colorsFromDB = await store.dispatch(
          "authModule/getColorsFromDatabase"
        );

        // Transforma el objeto de colores en una matriz de objetos con las propiedades "name" y "color"
        elements.value = Object.entries(colorsFromDB).map(
          ([name, { color }]) => ({ name, color })
        );

        console.log(elements.value);
      } catch (error) {
        console.error("Error al cargar los colores:", error);
      }
    });

    // Variable reactiva para almacenar el color seleccionado
    const selectedColor = ref("");

    // Función para guardar el color en la base de datos
    const saveColor = async (element) => {
      try {
        await store.dispatch("authModule/saveColorToDatabase", {
          name: element.name,
          color: element.color,
        });
      } catch (error) {
        console.error("Error al guardar el color:", error);
      }
    };

    const saveImg = async () => {
      const img = await addDataImageDB(image.value);
      console.log(img);
      try {
        await store.dispatch("authModule/saveColorToDatabase", {
          name: "fondo",
          color: img,
        });
      } catch (error) {
        console.error("Error al guardar el color:", error);
      }
    };
    const saveImg2 = async () => {
      const img2 = await addDataImageDB(image2.value);

      try {
        await store.dispatch("authModule/saveColorToDatabase", {
          name: "icono",
          color: img2,
        });
      } catch (error) {
        console.error("Error al guardar el color:", error);
      }
    };
    const saveImg3 = async () => {
      const img3 = await addDataImageDB(banner.value);

      try {
        await store.dispatch("authModule/saveColorToDatabase", {
          name: "banner",
          color: img3,
        });
      } catch (error) {
        console.error("Error al guardar el color:", error);
      }
    };

    return {
      elements,
      selectedColor,
      saveColor,
      userColors,
      handleImageUpload,
      image,
      image2,
      handleImageUpload2,
      addDataImageDB,
      saveImg,
      banner,
      handleImageUpload3,
      saveImg2,
      saveImg3,
    };
  },
};
</script>

<style scoped>
.elements-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.element-wrapper {
  width: 90%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
}

.element-wrapper2 {
  width: 90%;
  max-width: 400px;
}

.element-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.element-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>