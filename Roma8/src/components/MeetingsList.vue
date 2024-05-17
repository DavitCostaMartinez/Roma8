<template>
  <div class="meeting-list-container">
    <div class="column">
      <div v-for="meeting in meetings" :key="meeting.id">
        <meetings-page :meeting="meeting" />
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        @click="$router.push({ name: 'new-meeting' })"
        v-if="rolDB?.unirseReunion"
        style="background-color: lightgreen"
        fab
        color="inherit"
        :style="{
          backgroundColor: userColors?.Diseño?.color,
        }"
        icon="add"
      />
    </q-page-sticky>
  </div>
</template>
<script>
import useMeeting from "src/modules/meetings/composables/useMeeting";
import MeetingsPage from "./MeetingPage.vue";
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

export default {
  name: "MeetingsList",
  components: {
    MeetingsPage,
  },
  setup() {
    const store = useStore();
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const meetings = ref([]);
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const { loadMeetingsDB } = useMeeting();

    const loadMeetingsInfo = async () => {
      const meetingsDB = await loadMeetingsDB();
      if (meetingsDB && meetingsDB.length > 0) {
        meetings.value = meetingsDB.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
      } else {
        meetings.value = [];
      }
    };

    const isNewerOrEqualDate = () => {
      const today = new Date();

      const currentTime =
        today.getHours().toString().padStart(2, "0") +
        ":" +
        today.getMinutes().toString().padStart(2, "0");

      const dateActually =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        today.getDate().toString().padStart(2, "0");

      return meetings.value.filter((meeting) => {
        // Comprobamos si la fecha de la reunión es mayor o igual que la fecha actual
        // o si la fecha es igual pero la hora es mayor o igual a la hora actual
        return (
          meeting.date >= dateActually ||
          (meeting.date === dateActually && meeting.time >= currentTime)
        );
      });
    };

    onMounted(async () => {
      await loadMeetingsInfo();
      meetings.value = isNewerOrEqualDate();
    });

    return {
      rolDB,
      meetings,
      isNewerOrEqualDate,
      userColors,
    };
  },
};
</script>

<style scoped>
.meeting-list-container {
  height: auto;
}

.meeting-scrollarea {
  overflow: hidden;
}
</style>