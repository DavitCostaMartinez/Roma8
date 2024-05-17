<template>
  <div class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{ backgroundColor: userColors?.Diseño?.color }"
      icon="arrow_back"
      @click="goBack"
      class="buttonback"
    />
    <h1 class="h1withbutton">Reuniones</h1>
    <meetings-list />
  </div>
</template>
  
<script>
import MeetingsList from "../components/MeetingsList.vue";
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
export default {
  components: { MeetingsList },
  setup() {
    const store = useStore();
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const goBack = () => {
      history.back();
    };
    return {
      userColors,
      goBack,
    };
  },
};
</script>