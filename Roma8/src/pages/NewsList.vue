<template>
  <div class="q-pa-md">
    <h1>Noticias</h1>
    <div v-if="meeting?.participants[useredit.id]?.signature">
      <button @click="openModal">Abrir Modal</button>
      <q-infinite-scroll :offset="250">
        <q-dialog
          v-model="cardSignature"
          @show="loadSuggestionState"
          persistent
        >
          <q-card class="card">
            <signature-view />
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
          </q-card>
        </q-dialog>
      </q-infinite-scroll>
    </div>
    <div v-if="rolDB?.noticias?.leer">
      <template v-if="news.length > 0">
        <q-infinite-scroll :offset="250">
          <div
            v-for="(item, index) in news"
            :key="index"
            class="q-pa-md row items-start q-gutter-md d-flex justify-center"
          >
            <q-card class="col-12 col-sm-12 col-md-7 card" bordered>
              <q-img :src="item.photo" />
              <q-card-section>
                <div class="text-overline text-orange-9">
                  {{ formatDateShort(item.date) }}
                </div>
                <div
                  class="text-h5 q-mt-sm q-mb-xs"
                  style="overflow-wrap: break-word"
                  @click="openCardInformation(item)"
                >
                  {{ item.title }}
                </div>
                <br />
                <div
                  class="text-caption text-grey"
                  style="overflow-wrap: break-word"
                >
                  {{ item.shortDescription }}
                </div>
              </q-card-section>
              <q-card-actions>
                <q-btn
                  v-if="rolDB?.noticias?.eliminar"
                  color="inherit"
                  round
                  flat
                  icon="delete"
                  @click="openCard(item.id, item.photo)"
                />
                <q-dialog v-model="confirm" persistent>
                  <q-card>
                    <q-card-section class="row items-center">
                      <span class="q-ml-sm"
                        >¿Estás seguro que desea eliminar esta noticia?</span
                      >
                    </q-card-section>
                    <q-card-actions align="right">
                      <q-btn
                        flat
                        label="Cancelar"
                        color="primary"
                        v-close-popup
                      />
                      <q-btn
                        flat
                        label="Eliminar"
                        color="primary"
                        @click="deleteNewscastInfo"
                        v-close-popup
                      />
                    </q-card-actions>
                  </q-card>
                </q-dialog>
              </q-card-actions>
              <q-card-actions align="right" style="padding-right: 16px">
                <q-btn
                  color="secondary"
                  label="LEER MÁS"
                  @click="openCardInformation(item)"
                  style="padding: 8px 16px"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-infinite-scroll>

        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn
            @click="$router.push({ name: 'news-page' })"
            v-if="rolDB?.noticias?.crear"
            fab
            icon="add"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
          />
        </q-page-sticky>
      </template>
      <template v-else>
        <div>
          <h2>No hay noticias en este momento</h2>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn
              @click="$router.push({ name: 'news-page' })"
              v-if="rolDB?.noticias?.crear"
              fab
              icon="add"
              color="inherit"
              :style="{ backgroundColor: userColors?.Diseño?.color }"
            />
          </q-page-sticky>
        </div>
        <router-view />
      </template>
    </div>
    <q-infinite-scroll :offset="450">
      <q-dialog v-model="cardNews" persistent>
        <q-card class="card">
          <q-img
            v-if="selectedNews.photo"
            :src="selectedNews.photo"
            alt="Descripción de la imagen"
            style="max-width: 100%; max-height: 100%"
          />
          <q-card-section class="q-pa-md">
            <div class="row no-wrap items-center">
              <div class="col text-h6 q-mb-sm">
                {{ selectedNews.title }}
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none" style="max-height: 120px">
            <div class="row d-flex no-wrap align-center">
              <q-icon
                name="description"
                class="fs-22"
                style="margin-right: 10px; overflow-y: visible"
              />
              {{ selectedNews.description }}
            </div>
            <br />
            <div class="row d-flex no-wrap align-center">
              <q-icon name="event" class="fs-22" style="margin-right: 10px" />
              {{ formatDateShort(selectedNews.date) }}
            </div>
            <br />
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
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import useNews from "src/modules/news/composables/useNews";
import { storage } from "../boot/firebase";
import SignatureView from "../components/SignatureView.vue";

export default {
  components: { SignatureView },
  setup() {
    const store = useStore();
    const news = ref([]);
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    let useredit = computed(() => store.getters["authModule/getUserDB"]);
    const { loadNewsDB, deleteNewscastDBAndState } = useNews();
    const selectedId = ref(null);
    const selectedNews = ref(null);
    const confirm = ref(false);
    const cardNews = ref(false);
    const urlPhoto = ref("");
    let storageRef = storage.ref();
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const meeting = ref(null);
    const today = ref(new Date().toISOString().split("T")[0]);
    const cardSignature = ref(false);

    const load = async () => {
      meeting.value = await store.dispatch(
        "authModule/loadMeetinglive",
        today.value
      );
    };

    const openModal = () => {
      cardSignature.value = true;
    };

    const openCardInformation = (item) => {
      selectedNews.value = item;
      cardNews.value = true;
    };

    const handleCloseCard = () => {
      cardSignature.value = false;
      cardNews.value = false;
      confirm.value = false;
    };

    const loadNewsInfo = async () => {
      const newsDB = await loadNewsDB();

      if (newsDB && newsDB.length > 0) {
        news.value = newsDB.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
      } else {
        news.value = [];
      }
    };

    const deleteNewscastInfo = async () => {
      await deleteNewscastDBAndState(selectedId.value);

      const decodedUrl = decodeURIComponent(urlPhoto.value);
      const lastIndex = decodedUrl.lastIndexOf("/");
      const nombreArchivoConParametros = decodedUrl.substring(lastIndex + 1);
      const nombreArchivoSinParametros =
        nombreArchivoConParametros.split("?")[0];

      const desertRef = storageRef.child(
        `noticias/${nombreArchivoSinParametros}`
      );

      await desertRef
        .delete()
        .then(() => {
          console.log("Archivo eliminado");
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      await loadNewsInfo();
    };

    const openCard = async (id, photo) => {
      cardNews.value = false;
      confirm.value = true;
      selectedId.value = id;
      urlPhoto.value = photo;
    };

    onMounted(async () => {
      await loadNewsInfo();
      await load();
    });

    const formatDateShort = (dateNewscast) => {
      const date = new Date(dateNewscast);
      return date.toLocaleString();
    };

    return {
      expanded: ref(false),
      rolDB,
      news,
      formatDateShort,
      confirm,
      deleteNewscastInfo,
      openCard,
      userColors,
      today,
      useredit,
      openModal,
      handleCloseCard,
      openCardInformation,
      cardSignature,
      cardNews,
      selectedNews,
    };
  },
};
</script>