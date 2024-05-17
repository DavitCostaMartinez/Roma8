  <template>
  <div v-if="isNotified">
    <q-infinite-scroll :offset="250">
      <div
        v-for="(item, index) in votationItems"
        :key="index"
        class="q-pa-md row items-start q-gutter-md d-flex justify-center"
      >
        <q-card class="col-12 col-sm-12 col-md-7 card" bordered>
          <q-card-section>
            <div
              class="text-h5 q-mt-sm q-mb-xs"
              style="overflow-wrap: break-word"
            >
              {{ item.order }}
            </div>
            <br />
            <div class="label text-grey" style="overflow-wrap: break-word">
              {{ item.question }}
            </div>
            <br />
            <q-btn
              v-for="(option, optionIndex) in options"
              :key="optionIndex"
              @click="addVotationPerson(option.text)"
              :label="option.text"
              class="column"
              :disabled="isVoted"
            />
          </q-card-section>
        </q-card>
      </div>
    </q-infinite-scroll>

    <div v-if="delegations.length > 0">
      <q-infinite-scroll :offset="250">
        <div
          v-for="(delegationData, delegationIndex) in delegations"
          :key="delegationIndex"
          class="q-pa-md d-flex items-start q-gutter-md"
        >
          <q-card
            class="col-12 col-sm-12 col-md-7 card"
            v-for="(vote, voteIndex) in votationItems"
            :key="voteIndex"
            bordered
          >
            <q-card-section>
              <div
                class="text-h5 q-mt-sm q-mb-xs"
                style="overflow-wrap: break-word"
              >
                {{ vote.order }}
              </div>
              <br />
              <div class="label text-grey" style="overflow-wrap: break-word">
                {{ vote.question }}
              </div>

              <q-btn
                v-for="(option, optionIndex) in options"
                :key="optionIndex"
                @click="addVotationDelegations(option.text, delegationData.id)"
                :label="option.text"
                class="column"
                :disabled="isVoted"
              />
            </q-card-section>
            <q-card-actions class="d-flex q-pa-md justify-between">
              Voto delegado de {{ delegationData.data.name }}
            </q-card-actions>
          </q-card>
        </div>
      </q-infinite-scroll>
    </div>
  </div>
</template>

  <script>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import useMeeting from "src/modules/meetings/composables/useMeeting";

export default {
  setup() {
    const meeting = ref(null);
    const isNotified = ref(false);
    const isVoted = ref(false);
    const store = useStore();
    const router = useRouter();
    const numCards = ref(null);
    const votesPeople = ref(0);
    const options = ref([]);
    const selectedOptionUser = ref(null);
    const votationItems = ref([]);
    const delegations = ref([]);
    const today = ref(new Date().toISOString().split("T")[0]);
    const currentVotation = ref({});
    const { saveMeetingVotes, saveIsVoted } = useMeeting();
    const indexOrder = ref(null);
    const useredit = computed(() => store.getters["authModule/getUserDB"]);
    const routeParams = router.currentRoute.value.params;

    const loadOptions = async () => {
      meeting.value = await store.dispatch(
        "authModule/loadMeetinglive",
        today.value
      );
      if (meeting.value) {
        Object.keys(meeting.value.votation).forEach((name) => {
          const votationItem = meeting.value.votation[name];
          if (votationItem.active) {
            isNotified.value = true;
            indexOrder.value = name;
            currentVotation.value = votationItem;
            votationItems.value.push({
              order: name,
              question: votationItem.question,
              active: votationItem.active,
              options: votationItem.options,
            });
          }
        });
        Object.keys(meeting.value.participants).forEach((participantId) => {
          const participant = meeting.value.participants[participantId];
          if (participantId === useredit.value.id) {
            isVoted.value = participant.isVoted;
            if (participant.delegations) {
              Object.keys(participant.delegations).forEach((del) => {
                const delegationData = {
                  id: del,
                  data: participant.delegations[del],
                };
                delegations.value.push(delegationData);
              });
            }
          }
        });
        if (votationItems.value.length > 0) {
          if (currentVotation.value && currentVotation.value.options) {
            currentVotation.value.options.forEach((option) => {
              if (!options.value.find((opt) => opt.text === option.text)) {
                options.value.push({ text: option.text, numVotes: [] });
              }
            });
          }
        }
      }
      numCards.value = votationItems.value.length + delegations.value.length;
    };

    const addVotationPerson = async (opt) => {
      let body = {},
        bodyIsVoted = {};

      if (opt) {
        Swal.fire({
          title: "Quieres votar la opcion " + opt + " ?",
          showDenyButton: true,
          confirmButtonText: "Si",
          denyButtonText: `No`,
        }).then(async (result) => {
          if (result.isConfirmed) {
            votesPeople.value++;
            const meetingFromDatabase = await store.dispatch(
              "authModule/loadMeetinglive",
              today.value
            );

            Object.keys(meetingFromDatabase.votation).forEach((name) => {
              if (meetingFromDatabase.votation[name].active) {
                currentVotation.value = meetingFromDatabase.votation[name];
              }
            });

            currentVotation.value.options.forEach((option, index) => {
              if (option.text === opt) {
                option.numVotes = option.numVotes || [];

                if (option.numVotes) {
                  if (!option.numVotes.includes(routeParams.id)) {
                    option.numVotes.push(routeParams.id);
                  }
                }
                body = {
                  date: today.value,
                  order: indexOrder.value,
                  text: option.text,
                  numVotes: option.numVotes,
                  index: index,
                };

                bodyIsVoted = {
                  id: routeParams.id,
                  date: today.value,
                };
              }
            });

            await saveMeetingVotes(body);
            /*
            if (numCards.value === votesPeople.value) {
              await saveIsVoted(bodyIsVoted);
            }
            */
            if (meetingFromDatabase.participants[routeParams.id]) {
              meetingFromDatabase.participants[routeParams.id].isVoted = true;
            }
            Swal.fire("Votación hecha!", "", "success");
            await store.dispatch(
              "authModule/saveMeetinglive",
              meetingFromDatabase
            );
          }
        });
      }
    };

    const addVotationDelegations = async (option, delegationId) => {
      let body = {};

      if (option) {
        Swal.fire({
          title: "¿Quieres votar la opción " + option + "?",
          showDenyButton: true,
          confirmButtonText: "Sí",
          denyButtonText: "No",
        }).then(async (result) => {
          if (result.isConfirmed) {
            votesPeople.value++;
            const meetingFromDatabase = await store.dispatch(
              "authModule/loadMeetinglive",
              today.value
            );

            Object.keys(meetingFromDatabase.votation).forEach((name) => {
              if (meetingFromDatabase.votation[name].active) {
                currentVotation.value = meetingFromDatabase.votation[name];
              }
            });
            currentVotation.value.options.forEach((opt, index) => {
              if (opt.text === option) {
                opt.numVotes = opt.numVotes || [];

                if (!opt.numVotes.includes(delegationId)) {
                  opt.numVotes.push(delegationId);
                }
                body = {
                  date: today.value,
                  order: indexOrder.value,
                  text: opt.text,
                  numVotes: opt.numVotes,
                  index: index,
                };
              }
            });
            await saveMeetingVotes(body);
            if (numCards.value === votesPeople.value) {
              if (meetingFromDatabase.participants[routeParams.id]) {
                const participant =
                  meetingFromDatabase.participants[routeParams.id];
                Object.keys(participant.delegations).forEach((del) => {
                  participant.delegations[del].isVoted = true;
                });
              }
            }
            await store.dispatch(
              "authModule/saveMeetinglive",
              meetingFromDatabase
            );
            Swal.fire("¡Votación hecha!", "", "success");
          }
        });
      }
    };

    onMounted(async () => {
      await loadOptions();
    });

    return {
      options,
      votationItems,
      addVotationPerson,
      addVotationDelegations,
      isNotified,
      isVoted,
      delegations,
      selectedOptionUser,
    };
  },
};
</script>