<template>
  <div class="profile-list-container">
    <q-btn
      color="inherit"
      :style="{ backgroundColor: userColors?.Diseño?.color }"
      icon="arrow_back"
      @click="goBack"
      class="buttonback"
    />
    <h1 class="h1withbutton">Perfil</h1>
    <div class="profile-picture">
      <div class="image-container">
        <img
          v-if="user.photo && !localImage"
          :src="user.photo"
          @click="onSelectImage"
          alt="photo-profile"
          class="camera-icon"
        />
        <img
          v-else-if="localImageDefault && !localImage"
          :src="localImageDefault"
          @click="onSelectImage"
          alt="photo-profile"
          class="img-thumbnail"
        />
        <img
          v-else
          :src="localImage"
          @click="onSelectImage"
          alt="photo-profile"
          class="img-thumbnail"
        />
      </div>
      <input
        type="file"
        @change="onSelectedImage"
        ref="imageSelector"
        v-show="false"
        accept="image/png, image/jpeg"
      />
      <button
        color="inherit"
        :style="{ backgroundColor: userColors?.Diseño?.color }"
        @click="onSelectImage"
        class="material-icons add-photo"
      >
        add_a_photo
      </button>
    </div>
    <div class="profile">
      <div class="profile-info">
        <div class="profile-details">
          <q-input outlined v-model="user.name" label="Nombre" readonly />
          <q-input outlined v-model="user.surname" label="Apellidos" readonly />
          <q-input
            outlined
            v-model="user.email"
            label="Correo electrónico"
            @change="onEmailInputChange"
            type="email"
            :rules="[
              (val) => (val && val.length > 0) || 'Este campo es obligatorio',
              isValidEmail,
            ]"
          />
          <q-input
            outlined
            v-model="user.phone"
            label="Teléfono"
            type="tel"
            :rules="[
              (val) =>
                /^[0-9]+$/.test(val) ||
                'Por favor, introduce solo números en el teléfono',
              (val) =>
                (val && val.length === 9) ||
                'El número de teléfono debe tener 9 dígitos',
            ]"
          />
          <q-input
            outlined
            v-model="house.floor"
            readonly
            label="Piso"
            lazy-rules
          />
          <q-input
            outlined
            v-model="house.n_door"
            readonly
            label="Numero Planta"
          />
          <q-input outlined v-model="house.stair" readonly label="Escalera" />
          <q-input
            outlined
            v-model="passwordUser"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            :rules="[
              (val) => (val && val.length > 0) || 'Este campo es obligatorio',
            ]"
          >
            <template v-slot:append>
              <div class="button-container">
                <q-icon
                  name="visibility"
                  v-if="!showPassword"
                  @click="showPassword = !showPassword"
                />
                <q-icon
                  name="visibility_off"
                  v-else
                  @click="showPassword = !showPassword"
                />
                <q-icon name="refresh" @click="onUpdatePassword" />
              </div>
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <div align="right">
      <q-btn
        @click="onSaveProfile"
        color="primary"
        icon="save"
        style="margin-top: 15px; padding: 13px; border-radius: 60px"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../modules/auth/composables/useAuth";
import Swal from "sweetalert2";
import { useStore } from "vuex";
import { storage } from "../boot/firebase";
import firebase from "firebase/compat/app";

export default {
  name: "ProfilePage",
  setup() {
    const store = useStore();
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const house = computed(() => store.getters["authModule/getHouseDB"]);
    const user = ref({});
    const passwordUser = ref(null);
    //user.value = userState.value;
    const localImage = ref(null);
    const fileImage = ref(null);
    const localImageDefault = ref();
    const originalEmail = ref("");
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const {
      loadUsersById,
      updateUserDBPhoto,
      updateUserAuthentication,
      updateUserDB,
      updatePasswordDB,
      updatePasswordAuthentication,
    } = useAuth();
    const router = useRouter();
    const routeParams = router.currentRoute.value.params;
    const userId = routeParams.id;
    const imageSelector = ref("");
    const emailChanged = ref(false);
    const showPassword = ref(false);
    let storageRef = storage.ref();

    const loadUserInfo = async () => {
      try {
        console.log(userId);
        const userData = await loadUsersById(userId);
        originalEmail.value = userData.email;
        user.value = userData;
        localImageDefault.value =
          "https://cdn.icon-icons.com/icons2/510/PNG/512/camera_icon-icons.com_50440.png";
      } catch (error) {
        console.error("Error al cargar la información del usuario:", error);
      }
    };

    const onSaveProfile = async () => {
      try {
        console.log(emailChanged.value);
        if (emailChanged.value) {
          await updateUserDB(user.value);
          await onSaveProfilePhoto();
          await updateUserAuthentication(user.value);
          Swal.fire(
            "Informacion actualizada correctamente",
            "Perfil actualizado con éxito",
            "success"
          );
          router.push({
            name: "login-screen",
          });
        } else {
          await updateUserDB(user.value);
          await onSaveProfilePhoto();
          Swal.fire(
            "Datos guardados correctamente",
            "Perfil actualizado con éxito",
            "success"
          );
        }
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
        Swal.fire("Error", "Ocurrió un error al actualizar perfil", "error");
      }
    };

    const onSaveProfilePhoto = async () => {
      try {
        console.log("La imagen es: ", fileImage.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("profile")
          .child(fileImage.value.name)
          .put(fileImage.value);

        const urlPhoto = await storageRef
          .child("profile")
          .child(fileImage.value.name)
          .getDownloadURL();

        await updateUserDBPhoto(user, urlPhoto);
        Swal.fire(
          "Se ha guardado la foto correctamente",
          "Foto actualizada con éxito",
          "success"
        );
      } catch (error) {
        console.log(error);
      }
    };

    const onUpdatePassword = async () => {
      try {
        await updatePasswordDB(user.value, passwordUser.value);
        await updatePasswordAuthentication(user.value, passwordUser.value);
        Swal.fire(
          "Tu contraseña se ha actualizado correctamente",
          "Contraseña actualizada con éxito",
          "success"
        );
        router.push({
          name: "login-screen",
        });
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
        Swal.fire("Error", "Ocurrió un error al actualizar perfil", "error");
      }
    };

    const onEmailInputChange = () => {
      emailChanged.value = user.value.email !== originalEmail.value;
      console.log(emailChanged.value);
    };

    const onSelectImage = async () => {
      imageSelector.value.click();
    };

    onMounted(() => {
      loadUserInfo();
    });
    const goBack = () => {
      history.back();
    };

    return {
      user,
      passwordUser,
      showPassword,
      fileImage,
      localImage,
      userState,
      emailChanged,
      onEmailInputChange,
      localImageDefault,
      imageSelector,
      loadUsersById,
      onSelectedImage(event) {
        const file = event.target.files[0];
        if (!file) {
          localImage.value = null;
          fileImage.value = null;
          return;
        }
        fileImage.value = file;
        const fr = new FileReader();
        fr.onload = () => (localImage.value = fr.result);
        fr.readAsDataURL(file);
      },
      isValidEmail(val) {
        const emailPattern =
          /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
        return emailPattern.test(val) || "Correo introducido no válido";
      },
      onSaveProfile,
      onSelectImage,
      onUpdatePassword,
      onSaveProfilePhoto,
      house,
      goBack,
      userColors,
    };
  },
};
</script>

<style scoped>
.profile-list-container {
  overflow: scroll;
}

.profile {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.profile-info {
  justify-content: center;
  align-items: center;
}

.profile-picture {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture img {
  width: 130px;
  height: 130px;
  object-fit: cover;
  border-radius: 90px;
}

.profile-picture img:hover {
  background-color: lightgray;
}

.camera-icon {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-icon img {
  width: 50px;
  height: 50px;
}

.profile-details {
  margin: 6px;
}

.profile-details p {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.add-photo {
  position: absolute;
  border: 1px solid black;
  border-radius: 135px;
  background-color: aquamarine;
  color: black;
  cursor: pointer;
  margin-top: 125px;
  margin-left: 70px;
  font-size: 26px;
  padding: 7px;
  transition: all 0.3s ease;
  z-index: 2; /* Asegura que el botón esté sobre el icono */
}

.add-photo:hover {
  filter: brightness(1.2);
}

.image-container {
  position: relative;
}

.fab-button {
  border-radius: 50px;
  border: 1px solid black;
  background-color: lightcyan;
  font-size: 30px;
  padding: 12px;
  float: right;
  margin: 32px;
}

.button-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}
</style>