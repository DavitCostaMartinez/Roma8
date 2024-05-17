<template>
  <div class="q-pa-lg">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <label>Titulo de sugerencia </label>
      <q-input
        filled
        name="title"
        v-model="suggestion.title"
        placeholder="Introduce titulo de sugerencia"
        :rules="[
          (val) => (val && val.length > 0) || 'Este campo es obligatorio',
        ]"
      >
        <template v-slot:prepend>
          <q-icon name="title" />
        </template>
      </q-input>

      <div style="max-width: 100%">
        <label>Descripción </label>
        <q-input
          v-model="suggestion.description"
          filled
          name="description"
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
        <button
          class="button-container"
          @click="onSelectImage"
          :style="{ backgroundColor: userColors?.Diseño?.color }"
        >
          <i class="material-icons" style="margin-right: 10px">cloud_upload</i>
          SUBIR FOTO
        </button>
      </div>
      <br />
      <div class="q-pa-md" style="max-width: 600px">
        <div class="profile-picture">
          <div class="image-container">
            <img
              v-if="suggestion.photo && !localImage"
              :src="suggestion.photo"
              alt="photo-suggestion"
              class="camera-icon"
              style="max-width: 100%; max-height: 100%"
            />
            <img
              v-if="localImage"
              :src="localImage"
              alt="photo-suggestion"
              class="img-thumbnail"
              style="max-width: 100%; max-height: 100%"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Enviar"
            type="submit"
            :style="{ backgroundColor: userColors?.Diseño?.color }"
            class="q-ml-sm"
            padding="15px"
            @click="onCreateSuggestion"
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
            @click="onResetSuggestion"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Volver"
            type="reset"
            color="purple"
            padding="15px"
            class="q-ml-sm"
            @click="$router.push({ name: 'suggestions-list' })"
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
import useSuggestion from "src/modules/suggestions/composables/useSuggestion";
import { storage } from "../boot/firebase";
import firebase from "firebase/compat/app";
import useAuth from "../modules/auth/composables/useAuth";

export default {
  name: "newSuggestion",
  setup() {
    const route = useRouter();
    const store = useStore();
    let storageRef = storage.ref();
    const imageSelector = ref("");
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const suggestion = ref({
      title: "",
      description: "",
      date: "",
      photo: "",
      name: userState.value.name,
      idUser: userState.value.id,
    });
    const { createSuggestionDB } = useSuggestion();
    const userEmail = ref(null);
    const { loadRols } = useAuth();
    const fileImage = ref(null);
    const localImage = ref(null);
    const error = ref("");
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const users = computed(() => store.getters["authModule/getUsersmee"]);

    const onSubmit = async (event) => {
      try {
        event.preventDefault();
        if (
          suggestion.value.title === "" ||
          suggestion.value.description === ""
        ) {
          throw new Error("Error en la introducción de datos");
        }
        suggestion.value.date = new Date().toString();
        await addDataImageDB();
        await createSuggestionDB(suggestion.value);
        const rols = await loadRols();
        console.log(rols);
        const allowedRoles = [];

        Object.keys(rols).forEach((name) => {
          console.log("Rol:", name);
          if (rols[name].email) {
            allowedRoles.push(name);
          }
        });

        const filteredUsers = users.value.filter((user) =>
          allowedRoles.includes(user.role)
        );
        const usersEmails = filteredUsers.map((user) => {
          return {
            email: user.email,
            name: user.name + " " + user.surname,
          };
        });
        userEmail.value = usersEmails;


        
        const suggestionForm = {
          title: suggestion.value.title,
          description: suggestion.value.description,
          date: suggestion.value.date,
          photo: suggestion.value.photo,
          email: "avchaparro04@gmail.com",
          name: suggestion.value.name,
        };
        console.log("La sugerencia del formulario es: ", suggestionForm);
        if (
          suggestion.value.title === "" ||
          suggestion.value.description === ""
        ) {
          throw new Error("Error en la introducción de datos");
        }
        const result = await fetch({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...suggestionForm, secret: "firebaseIsCool" }),
        });
        console.log(result);

        Swal.fire(
          "La sugerencia se ha creado correctamente",
          "Sugerencia creada con éxito",
          "success"
        );
        route.push({
          name: "suggestions-list",
        });
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Error al crear la sugerencia", "error");
      }
    };

    const addDataImageDB = async () => {
      try {
        console.log(fileImage.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("suggestions")
          .child(fileImage.value.name)
          .put(fileImage.value);

        const urlDescarga = await storageRef
          .child("suggestions")
          .child(fileImage.value.name)
          .getDownloadURL();

        suggestion.value.photo = urlDescarga;
        error.value = "Imagen subida con éxito";
        fileImage.value = null;
      } catch (error) {
        console.log(error);
      }
    };

    const onResetSuggestion = async () => {
      suggestion.value.title = null;
      suggestion.value.description = null;
      suggestion.value.date = "";
      suggestion.value.photo = "";
      localImage.value = null;
      fileImage.value = null;
    };

    return {
      suggestion,
      fileImage,
      localImage,
      imageSelector,
      onResetSuggestion,
      onSelectedImage(event) {
        const file = event.target.files[0];
        fileImage.value = file;
        if (!file) {
          fileImage.value = null;
          return;
        }
        const reader = new FileReader();
        console.log("El archivo es: ", fileImage.value.name);
        reader.onload = (e) => {
          localImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      onSelectImage(event) {
        event.preventDefault();
        imageSelector.value.click();
      },
      onSubmit,
      addDataImageDB,
      userColors,
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