<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <label>Titulo de noticia </label>
      <q-input
        filled
        v-model="news.title"
        placeholder="Introduce titulo de noticia"
        :rules="[
          (val) => (val && val.length > 0) || 'Este campo es obligatorio',
        ]"
      >
        <template v-slot:prepend>
          <q-icon name="title" />
        </template>
      </q-input>
      <div class="item-content">
        <label>Descripción corta</label>
        <q-input
          v-model="news.shortDescription"
          filled
          class="rounded-borders"
        />
      </div>
      <div class="item-content">
        <label>Descripción completa</label>
        <q-input
          v-model="news.description"
          filled
          class="rounded-borders"
          type="textarea"
        />
      </div>
      <br />
      <div class="input-group my-3">
        <input
          type="file"
          @change="onSelectedImage"
          ref="imageSelector"
          v-show="false"
          accept="image/png, image/jpeg"
        />
        <button class="button-container" @click="onSelectImage">
          <i class="material-icons" style="margin-right: 10px">cloud_upload</i>
          SUBIR FOTO
        </button>
      </div>
      <br />
      <div class="q-pa-md" style="max-width: 600px">
        <div class="profile-picture">
          <div class="image-container">
            <img
              v-if="news.photo && !localImage"
              :src="news.photo"
              alt="photo-news"
              class="camera-icon"
              style="max-width: 100%; max-height: 100%"
            />
            <img
              v-if="localImage"
              :src="localImage"
              alt="photo-news"
              class="img-thumbnail"
              style="max-width: 100%; max-height: 100%"
            />
          </div>
        </div>
      </div>
      <div class="row justify-around">
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Enviar"
            type="submit"
            color="green"
            class="q-ml-sm"
            padding="15px"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Borrar"
            type="reset"
            color="red"
            padding="15px"
            class="q-ml-sm"
            @click="onResetNews"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Cancelar"
            type="reset"
            color="purple"
            padding="15px"
            class="q-ml-sm"
            @click="$router.push({ name: 'news-list' })"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useStore } from "vuex";
import useNews from "src/modules/news/composables/useNews";
import { storage } from "../boot/firebase";
import firebase from "firebase/compat/app";

export default {
  name: "NewsPage",
  setup() {
    const route = useRouter();
    const store = useStore();
    let storageRef = storage.ref();
    const imageSelector = ref("");

    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const news = ref({
      title: "",
      description: "",
      shortDescription: "",
      date: "",
      photo: "",
      type: "noticia",
      name: userState.value.name,
    });
    const { createNewsDB } = useNews();
    const fileImage = ref(null);
    const localImage = ref(null);
    const error = ref("");

    const onSubmit = async (event) => {
      try {
        event.preventDefault();
        if (news.value.title === "" || news.value.description === "") {
          throw new Error("Error en la introducción de datos");
        }
        news.value.date = new Date().toString();
        await addDataImageDB();
        await createNewsDB(news.value);
        Swal.fire(
          "La noticia se ha creado correctamente",
          "Noticia creada con éxito",
          "success"
        );
        route.push({
          name: "news-list",
        });
      } catch (error) {
        Swal.fire("Error", "Error al crear la noticia", "error");
      }
    };

    const addDataImageDB = async () => {
      try {
        console.log(fileImage.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("noticias")
          .child(fileImage.value.name)
          .put(fileImage.value);

        const urlDescarga = await storageRef
          .child("noticias")
          .child(fileImage.value.name)
          .getDownloadURL();

        news.value.photo = urlDescarga;
        error.value = "Imagen subida con éxito";
        fileImage.value = null;
      } catch (error) {
        console.log(error);
      }
    };

    const onResetNews = async () => {
      news.value.title = null;
      news.value.description = null;
      news.value.date = "";
      news.value.photo = null;
      localImage.value = null;
      fileImage.value = null;
    };

    return {
      news,
      fileImage,
      localImage,
      imageSelector,
      onResetNews,
      onSelectedImage(event) {
        const file = event.target.files[0];
        fileImage.value = file;
        if (!file) {
          fileImage.value = null;
          return;
        }
        const reader = new FileReader();
        console.log("El archivo es: ", fileImage.value.name);
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          localImage.value = e.target.result;
        };
      },
      onSelectImage(event) {
        event.preventDefault();
        imageSelector.value.click();
      },
      addDataImageDB,
      onSubmit,
    };
  },
};
</script>

<style lang="scss" scoped>
.full-width.with-border {
  border: 1px solid lightslategray;
  border-radius: 5px;
  padding: 8px;
}

.full-width.with-border:hover {
  border: 1px solid black;
  padding: 8px;
}

.date-time-inputs {
  width: 100%;
}

.image-container {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
}

.camera-icon img {
  width: 10px;
  height: 50px;
}

.custom-btn {
  background-color: #03066a;
  font-weight: bold;
  color: #fff;
  border: none;
  font-size: 16px;
  border-radius: 12px;
  cursor: pointer;
  width: 140px;
  height: 60px;
}

.custom-btn:hover {
  background-color: #0c1d37;
}

.d-flex {
  display: flex;
}

.justify-center {
  margin: 0px auto;
}

.profile-picture {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture img {
  width: 280px;
  height: 275px;
  object-fit: cover;
  border-radius: 30px;
  border: 2px solid darkblue;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $primary;
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  color: white;
  font-weight: 900;
}
</style>