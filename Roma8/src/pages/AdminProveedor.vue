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
    <h1 class="h1withbutton">Proveedores</h1>
    <div class="q-gutter-md">
      <!-- Sección de Crear/Editar Espacio -->
      <q-card class="q-mb-sm carduser">
        <q-card-section>
          <h2 v-if="!editingSpace" class="text-h6">Crear Proveedor</h2>
          <h2 v-if="editingSpace" class="text-h6">Editar Proveedor</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="prov.name" hint="Nombre Proveedor" />
          <q-input v-model="prov.activity" hint="Actividad" />
          <q-input v-model="prov.email" type="email" hint="Email" />
          <q-input
            v-model="prov.telephone"
            type="tel"
            hint="Telephone number"
          />
        </q-card-section>
        <br />
        <div class="input-group my-3">
          <input
            type="file"
            @change="onSelectedImage"
            ref="imageSelector"
            v-show="false"
            accept="image/png, image/jpeg"
          />
          <q-btn
            class="button-container"
            @click="onSelectImage"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
          >
            <i class="material-icons" style="margin-right: 10px"
              >cloud_upload</i
            >
            SUBIR FOTO
          </q-btn>
        </div>
        <div class="q-pa-md" style="max-width: 500px">
          <div class="profile-picture">
            <div class="image-container">
              <img
                v-if="prov.photo && !localImage"
                :src="prov.photo"
                alt="photo-supply"
                class="camera-icon"
                style="max-width: 100%; max-height: 100%"
              />
              <img
                v-if="localImage"
                :src="localImage"
                alt="photo-supply"
                class="img-thumbnail"
                style="max-width: 100%; max-height: 100%"
              />
            </div>
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn
            v-if="!editingSpace"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Crear"
            @click="saveSupplierDB"
          />
          <q-btn
            v-if="editingSpace"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Guardar"
            @click="updateSupplier"
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

      <div class="supply-list">
        <h2 class="text-h6">Lista de Proveedores</h2>
        <div
          v-for="(supply, index) in suppliers"
          :key="index"
          class="space carduser"
        >
          <div class="space-info">
            <ul>
              <li><strong>Nombre:</strong> {{ supply.name }}</li>
              <li><strong>Actividad:</strong> {{ supply.activity }}</li>
              <li><strong>Correo electronico:</strong> {{ supply.email }}</li>
              <li>
                <strong>Numero de telefono:</strong> {{ supply.telephone }}
              </li>
              <li>
                <img :src="supply.photo" style="max-width: 50%" />
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
                @click="editSupplier(supply)"
              />
              <q-btn
                color="inherit"
                :style="{
                  backgroundColor: userColors?.Diseño?.color,
                  margin: '5px',
                }"
                label="Eliminar"
                @click="deleteSupplier(supply.id)"
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
import useSuppliers from "src/modules/suppliers/composables/useSuppliers";
import Swal from "sweetalert2";

export default {
  name: "AdminProveedor",
  setup() {
    const prov = ref({
      name: "",
      telephone: "",
      activity: "",
      email: "",
      photo: "",
    });
    const editingSpace = ref(false);
    const oldIdSupply = ref(null);
    const imageSelector = ref(null);
    const fileImage = ref(null);
    const localImage = ref(null);
    const suppliers = ref([]);
    const store = useStore();
    let storageRef = storage.ref();
    const error = ref("");
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const {
      createSuppliersDB,
      loadSuppliersDB,
      updateSupplierDB,
      deleteSupplierDB,
    } = useSuppliers();

    const addDataImageDB = async () => {
      try {
        console.log("La foto es: ", fileImage.value.name);
        storageRef = firebase.storage().ref();
        await storageRef
          .child("proveedores")
          .child(fileImage.value.name)
          .put(fileImage.value);

        const urlDescarga = await storageRef
          .child("proveedores")
          .child(fileImage.value.name)
          .getDownloadURL();

        prov.value.photo = urlDescarga;
        error.value = "Imagen subida con éxito";
        fileImage.value = null;
        return urlDescarga;
      } catch (error) {
        console.log(error);
      }
    };

    const saveSupplierDB = async () => {
      await addDataImageDB();
      await createSuppliersDB(prov.value);
      Swal.fire(
        "El proveedor se ha creado correctamente",
        "Proveedor creado con éxito",
        "success"
      );
      await loadSuppliersInfo();
      cancel();
    };

    const deleteSupplier = async (id) => {
      try {
        await deleteSupplierDB(id);
        await loadSuppliersInfo();
      } catch (error) {
        console.error("Error deleting prov:", error);
      }
    };

    const loadSuppliersInfo = async () => {
      const suppliersDB = await loadSuppliersDB();
      if (suppliersDB && suppliersDB.length > 0) {
        suppliers.value = suppliersDB;
      } else {
        suppliers.value = [];
      }
    };

    const editSupplier = (supply) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prov.value.name = supply.name;
      prov.value.activity = supply.activity;
      prov.value.email = supply.email;
      prov.value.telephone = supply.telephone;
      prov.value.photo = supply.photo;
      fileImage.value = supply.photo;
      editingSpace.value = true;
      oldIdSupply.value = supply.id;
    };

    const cancel = () => {
      prov.value.name = "";
      prov.value.email = "";
      prov.value.activity = "";
      prov.value.telephone = "";
      prov.value.photo = "";
      localImage.value = "";
      editingSpace.value = false;
    };

    const updateSupplier = async () => {
      const newUrl = await addDataImageDB();
      const updatedSpace = {
        oldIdSupplier: oldIdSupply.value,
        supplier: {
          name: prov.value.name,
          email: prov.value.email,
          photo: newUrl,
          telephone: prov.value.telephone,
          activity: prov.value.activity,
        },
      };
      await updateSupplierDB(updatedSpace);
      Swal.fire(
        "El proveedor se ha editado correctamente",
        "Proveedor actualizado con éxito",
        "success"
      );
      await loadSuppliersInfo();
      editingSpace.value = false;
      prov.value = {};
      localImage.value = "";
    };

    onMounted(async () => {
      await loadSuppliersInfo();
    });

    return {
      prov,
      suppliers,
      saveSupplierDB,
      deleteSupplier,
      editSupplier,
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
      updateSupplier,
      addDataImageDB,
      cancel,
      error,
      userColors,
      imageSelector,
      localImage,
      editingSpace,
    };
  },
};
</script>

<style lang="scss" scoped>
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