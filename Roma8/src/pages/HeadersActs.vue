<template>
  <div class="q-pa-md q-gutter-sm">
    <h1>Encabezados Actas</h1>
    <br />
    <h3>Cabecera Acta Junta General Ordinaria</h3>
    <q-editor
      v-model="headerAct3.notes"
      min-height="5rem"
      @input="processNotes"
    />

    <q-card flat bordered>
      <q-card-section>
        <pre>{{ processedNotes }}</pre>
      </q-card-section>
    </q-card>

    <h3>Cabecera Acta Junta General Extraordinaria</h3>
    <q-editor
      v-model="headerAct1.notes"
      min-height="5rem"
      @input="processNotes"
    />

    <q-card flat bordered>
      <q-card-section>
        <pre>{{ processedNotes }}</pre>
      </q-card-section>
    </q-card>

    <h3>Cabecera Acta Junta Directiva</h3>
    <q-editor
      v-model="headerAct2.notes"
      min-height="5rem"
      @input="processNotes"
    />

    <q-card flat bordered>
      <q-card-section>
        <pre>{{ processedNotes }}</pre>
      </q-card-section>
    </q-card>

    <h3>Apertura Sesión</h3>
    <q-editor
      v-model="openingSession.notes"
      min-height="5rem"
      @input="processNotes"
    />

    <q-card flat bordered>
      <q-card-section>
        <pre>{{ processedNotes }}</pre>
      </q-card-section>
    </q-card>

    <h3>Cierre Sesión</h3>
    <q-editor
      v-model="finishSession.notes"
      min-height="5rem"
      @input="processNotes"
    />

    <q-card flat bordered>
      <q-card-section>
        <pre>{{ processedNotes }}</pre>
      </q-card-section>
    </q-card>

    <q-btn
      :style="{ backgroundColor: userColors?.Diseño?.color, float: 'right' }"
      @click="updateFormattedNote"
      class="large-button"
      label="GUARDAR"
    >
    </q-btn>
    <div v-html="processedNotes"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import useAuth from "../modules/auth/composables/useAuth";

export default {
  setup() {
    const store = useStore();
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const notes = ref("");
    const processedNotes = ref("");
    const { saveHeaderActs } = useAuth();

    const headerAct1 = ref({
      name: "Acta de la Junta Extraordinaria DE LA COMUNIDAD DE PROPIETARIOS",
      notes: "",
      type: "header",
    });

    const headerAct2 = ref({
      name: "Acta de la Junta Directiva de la comunidad de propietarios",
      notes: "",
      type: "header",
    });

    const headerAct3 = ref({
      name: "Acta de la Junta General Ordinaria DE LA COMUNIDAD DE PROPIETARIOS",
      notes: "",
      type: "header",
    });

    const openingSession = ref({
      notes: "",
      type: "openingSession",
    });

    const finishSession = ref({
      notes: "",
      type: "finishingSession",
    });

    onMounted(() => {
      processNotes();
    });

    const processNotes = () => {
      console.log("Hola: ", headerAct1.value.notes);
      console.log(headerAct2.value.notes);
    };

    const updateFormattedNote = async () => {
      await saveHeaderActs(
        headerAct1.value,
        headerAct2.value,
        headerAct3.value,
        openingSession.value,
        finishSession.value
      );
    };

    return {
      rolDB,
      notes,
      updateFormattedNote,
      processedNotes,
      processNotes,
      headerAct1,
      headerAct2,
      headerAct3,
      openingSession,
      finishSession
    };
  },
};
</script>