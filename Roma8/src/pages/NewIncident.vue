<template>
  <div class="q-pa-md">
    <q-form id="form" @submit="onSubmit" class="q-gutter-md">
      <label>Titulo de incidencia </label>
      <q-input
        filled
        v-model="incident.title"
        placeholder="Introduce titulo de incidencia"
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
          v-model="incident.description"
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
      <div class="q-pa-md" style="max-width: 500px">
        <div class="profile-picture">
          <div class="image-container">
            <img
              v-if="incident.photo && !localImage"
              :src="incident.photo"
              alt="photo-incident"
              class="camera-icon"
              style="max-width: 100%; max-height: 100%"
            />
            <img
              v-if="localImage"
              :src="localImage"
              alt="photo-incident"
              class="img-thumbnail"
              style="max-width: 100%; max-height: 100%"
            />
          </div>
        </div>
      </div>
      <div class="row justify-around">
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="enviar"
            type="submit"
            :style="{ backgroundColor: userColors?.Diseño?.color }"
            class="q-ml-sm"
            padding="15px"
            @click="onCreateIncident"
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
            @click="onResetIncident"
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
            @click="$router.push({ name: 'incidents-list' })"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useStore } from "vuex";
import useIncident from "src/modules/incident/composables/useIncident";
import { storage } from "../boot/firebase";
import firebase from "firebase/compat/app";
import useAuth from "../modules/auth/composables/useAuth";

export default {
  name: "NewIncident",
  setup() {
    const route = useRouter();
    const store = useStore();
    const photo = ref(null);
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const incident = ref({
      title: "",
      description: "",
      date: "",
      photo: "",
      state: "Abierta",
      name: userState.value.name,
      idUser: userState.value.id,
    });
    const { createIncidentDB } = useIncident();
    const { loadRols } = useAuth();
    const imageSelector = ref(null);
    const fileImage = ref(null);
    const localImage = ref(null);
    let storageRef = storage.ref();
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const users = computed(() => store.getters["authModule/getUsersmee"]);

    const onSubmit = async (event) => {
      try {
        event.preventDefault();
        if (incident.value.title === "" || incident.value.description === "") {
          throw new Error("Error en la introducción de datos");
        }
        console.log("La foto es: ", incident.value.photo);
        incident.value.date = new Date().toString();
        await addDataImageDB();
        await createIncidentDB(incident.value);
        const rols = await loadRols();
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

        Swal.fire(
          "Su incidencia se creó correctamente",
          "Incidencia creada con éxito",
          "success"
        );
        route.push({
          name: "incidents-list",
        });
      } catch (error) {
        Swal.fire("Error", "Error al crear la incidencia", "error");
      }
    };

    const addDataImageDB = async () => {
      try {
        console.log(fileImage.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("incidents")
          .child(fileImage.value.name)
          .put(fileImage.value);

        const urlDescarga = await storageRef
          .child("incidents")
          .child(fileImage.value.name)
          .getDownloadURL();

        incident.value.photo = urlDescarga;
        error.value = "Imagen subida con éxito";
        fileImage.value = null;
      } catch (error) {
        console.log(error);
      }
    };

    watch(photo, (newPhoto) => {
      incident.value.photo = newPhoto;
    });

    const onResetIncident = async () => {
      incident.value.title = null;
      incident.value.description = null;
      incident.value.date = "";
      incident.value.photo = "";
      localImage.value = null;
      fileImage.value = null;
    };
    return {
      incident,
      imageSelector,
      fileImage,
      localImage,
      photo,
      onResetIncident,
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
      addDataImageDB,
      onSubmit,
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

.rounded-borders input {
  border: 2px solid #ccc; /* Cambia el grosor y el color del borde según sea necesario */
  border-radius: 5px; /* Ajusta el radio de los bordes para que sean redondeados */
}
</style>