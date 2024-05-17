<template>
  <div class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{ backgroundColor: userColors?.Diseño?.color }"
      icon="arrow_back"
      @click="goBack"
      class="buttonback"
    />
    <h1 class="h1withbutton">Proveedores</h1>
    <template v-if="suppliers.length > 0">
      <q-infinite-scroll :offset="250">
        <div
          v-for="(supplier, index) in suppliers"
          :key="index"
          class="q-pa-md row items-start q-gutter-md d-flex justify-center"
        >
          <q-card
            class="col-12 col-sm-12 col-md-7 card"
            bordered
          >
            <q-img :src="supplier.photo" />
            <q-card-section>
              <div class="row d-flex no-wrap items-center">
                <div class="text-h6 q-mt-sm" style="overflow-wrap: break-word">
                  <q-icon name="person" size="22px" style="margin-right: 3px" />
                  {{ supplier.name }}
                </div>
              </div>
              <br />
              <div class="row d-flex no-wrap items-center">
                <q-icon name="work" size="22px" style="margin-right: 10px" />
                {{ supplier.activity }}
              </div>
              <br />
              <div class="row d-flex no-wrap items-center">
                <q-icon name="email" size="22px" style="margin-right: 10px" />
                {{ supplier.email }}
              </div>
              <br />
              <div class="row d-flex no-wrap items-center">
                <q-icon name="phone" size="22px" style="margin-right: 10px" />
                <a :href="'tel:' + supplier.telephone">{{
                  supplier.telephone
                }}</a>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-infinite-scroll>
    </template>
    <template v-else>
      <div>
        <h2>No hay proveedores en este momento</h2>
      </div>
      <router-view />
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import useSuppliers from "src/modules/suppliers/composables/useSuppliers";
import { storage } from "../boot/firebase";

export default {
  setup() {
    const store = useStore();
    const suppliers = ref([]);
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    let useredit = computed(() => store.getters["authModule/getUserDB"]);
    const { loadSuppliersDB } = useSuppliers();
    const selectedId = ref(null);
    const confirm = ref(false);
    const urlPhoto = ref("");
    let storageRef = storage.ref();
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const selectedOption = ref("");
    const card = ref(false);
    const cardSignature = ref(false);

    const loadSuppliersInfo = async () => {
      const suppliersDB = await loadSuppliersDB();
      if (suppliersDB && suppliersDB.length > 0) {
        suppliers.value = suppliersDB;
      } else {
        suppliers.value = [];
      }
    };

    const openCard = async (id, photo) => {
      confirm.value = true;
      selectedId.value = id;
      urlPhoto.value = photo;
    };

    onMounted(async () => {
      await loadSuppliersInfo();
    });

       const goBack = () => {
      history.back();
    };
    return {
      expanded: ref(false),
      rolDB,
      suppliers,
      confirm,
      openCard,
      userColors,
      useredit,
      card,
      selectedOption,
      cardSignature,
      goBack
    };
  },
};
</script>

<style scoped>
.my-card {
  width: 90%;
}
</style>