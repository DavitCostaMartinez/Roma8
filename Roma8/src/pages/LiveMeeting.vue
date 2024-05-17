  <template>
  <div class="q-pa-md">
    <div
      v-if="
        !meeting?.edit?.active &&
        meeting?.edit.usercanedit.id == useredit?.id &&
        rolDB?.editarReunion
      "
    >
      <div class="text-h4 d-flex">
        <q-icon name="title" class="fs-28" style="margin-right: 10px" />
        {{ meeting?.type }}
      </div>
      <br />
      <div class="text-h4 d-flex">
        <q-icon name="schedule" class="fs-28" style="margin-right: 10px" />
        <p class="time">Primera convocatoria: {{ meeting?.time }}</p>
        <p class="time">Segunda convocatoria: {{ formattedTime }}</p>
      </div>
      <br />
      <div
        class="text-h4 d-flex"
        style="margin-bottom: 10px; overflow-wrap: break-word"
      >
        <q-icon name="groups" class="fs-28" />
        Participantes:
      </div>

      <div v-for="(participant, name) in meeting?.participants" :key="name">
        <h3>{{ participant.name }}</h3>
        <br />
        <p><input type="checkbox" v-model="participant.active" /> Activo</p>
        <p><input type="checkbox" v-model="participant.signature" /> Firma</p>
        <div>
          <button @click="toggleDelegations(name)">Mostrar Delegaciones</button>
          <div v-if="showDelegations[name]">
            <h4>Delegaciones:</h4>
            <ul>
              <li
                v-for="(delegation, delegationName) in participant?.delegations"
                :key="delegationName"
              >
                {{ delegation.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <q-infinite-scroll :offset="350">
        <q-dialog v-model="card" @show="loadMeetingState" persistent>
          <q-card class="my-card">
            <q-card-section class="q-pa-md">
              <div class="row wrap">
                <div class="col">
                  <div
                    class="text-h6"
                    style="
                      font-weight: bold;
                      margin-bottom: 25px;
                      overflow-wrap: break-word;
                    "
                  >
                    Iniciar votación
                  </div>
                  <div class="text" style="overflow-wrap: break-word">
                    <label style="font-size: 16px"> {{ indexOrder }} </label>
                  </div>
                  <q-input v-model="questionOrder" :dense="dense" />
                  <br />
                  <div
                    class="text-h6"
                    style="margin-bottom: 10px; overflow-wrap: break-word"
                  >
                    <label style="font-size: 16px"> Opciones </label>
                  </div>
                  <ul>
                    <div
                      v-for="(vote, index) in votes"
                      :key="index"
                      style="margin-left: 20px"
                    >
                      <q-input
                        v-model="vote.text"
                        style="flex-grow: 1; width: 100%"
                        :placeholder="'Añadir'"
                        :rules="[
                          (val) =>
                            (val && val.length > 0) ||
                            'Este campo es obligatorio',
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="add" class="fs-28" />
                        </template>
                        <template v-slot:append>
                          <q-icon
                            name="delete"
                            size="sm"
                            style="cursor: pointer; color: red"
                            @click="deleteVote(index)"
                          />
                        </template>
                      </q-input>
                    </div>
                  </ul>
                  <q-btn
                    label="Añadir orden"
                    type="submit"
                    icon="add_circle"
                    padding="10px 14px"
                    @click="addVote"
                    style="border-radius: 25px"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    v-close-popup
                    flat
                    dense
                    icon="close"
                    class="q-ml-md"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                color="green"
                label="Iniciar"
                padding="10px"
                @click="onSendVotation(name)"
                style="border-radius: 19px; font-size: 15px"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-infinite-scroll>
      <br />
      <h3>Notas de las Ordenes</h3>
      <br />
      <div class="column" style="margin-right: 20px">
        <div>
          <label>
            Marcador: {{ countVotedParticipants() }} /
            {{ countTotalParticipants() }}
          </label>
        </div>
      </div>
      <br />
      <div v-for="(text, nameorden) in orderNote" :key="nameorden">
        <div class="row">
          <h4 style="margin-right: 20px">{{ nameorden }}</h4>
          <div v-for="(text, name) in meeting?.votation" :key="name">
            <div class="row items-center" v-if="nameorden === name">
              <div class="column">
                <q-btn
                  v-if="!text.active"
                  type="submit"
                  style="
                    border-radius: 10px;
                    font-size: 4px;
                    background-color: lightcoral;
                  "
                  @click="openModal(nameorden)"
                  icon="how_to_vote"
                >
                  CREAR VOTACION
                </q-btn>
                <q-btn
                  v-if="text.active"
                  style="
                    border-radius: 10px;
                    font-size: 10px;
                    background-color: yellow;
                  "
                  @click="finishVotation"
                  icon="how_to_vote"
                >
                  FINALIZAR VOTACION
                </q-btn>
              </div>
              <div
                v-for="(option, name) in text.options"
                :key="name"
                class="column"
                style="margin-right: 20px"
              >
                <label>{{ option.text }}</label>
                <div v-if="option.numVotes">
                  <label> {{ option.numVotes.length }} </label>
                </div>
                <div v-else>
                  <label>0</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <q-editor
          v-model="orderNote[nameorden]"
          min-height="5rem"
          @input="updateFormattedOrder(nameorden, orderNote[nameorden])"
        />
      </div>
      <h3>Ruegos y Preguntas</h3>
      <q-editor
        v-model="notes"
        min-height="5rem"
        @input="updateFormattedNote"
      />
      <div v-for="(participant, index) in meeting?.participants" :key="index">
        <img :src="participant.url" style="max-width: 50%" />
      </div>
    </div>

    <!-- MODO DE VISUALIZAR-->
    <div class="meeting-details" v-else>
      <div v-if="meeting?.participants[useredit.id]?.signature">
        <q-btn
          color="inherit"
          :style="{
            backgroundColor: userColors?.Diseño?.color,
            float: 'right',
            margin: '5px',
          }"
          @click="openModal2"
          >Abrir Firma</q-btn
        >
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
      <q-btn
        color="inherit"
        :style="{
          backgroundColor: userColors?.Diseño?.color,
          float: 'right',
          margin: '5px',
        }"
        @click="endEdit"
        v-show="meeting?.edit.active"
        icon="edit"
      >
        Editar reunion
      </q-btn>
      <div id="element-to-pdf">
        <div class="meeting-info">
          <h2 class="title">{{ meeting?.type }}</h2>
        </div>
        <br />
        <div v-html="notesHeaders"></div>
        <h2 :style="{ color: userColors?.Diseño?.color }">Participantes</h2>
        <div class="participants">
          <div v-for="(participant, name) in meeting?.participants" :key="name">
            <div v-if="participant.active" class="participant">
              <h3>{{ participant.name }}</h3>
              <div v-if="hasActiveDelegations(participant)" class="delegations">
                <h4>Delegaciones:</h4>
                <div
                  v-for="(
                    delegation, delegationName
                  ) in participant?.delegations"
                  :key="delegationName"
                  class="delegation"
                >
                  <span v-if="delegation.active">{{ delegation.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-html="openingSession"></div>
        <br />
        <h2 :style="{ color: userColors?.Diseño?.color }">
          Notas de las Órdenes
        </h2>
        <div
          class="order-notes"
          v-for="(text, nameOrden) in meeting?.ordernotes"
          :key="nameOrden"
        >
          <h3>{{ nameOrden }}</h3>
          <div v-for="(text, name) in meeting?.votation" :key="name">
            <div v-if="nameOrden === name">
              <div
                v-for="(option, index) in text?.options"
                :key="index"
                class="row justify-center"
                style="margin-right: 30px"
              >
                <h4>{{ option.text }}</h4>
                <div style="margin-left: 20px" v-if="option.numVotes">
                  <h4>{{ option.numVotes.length }}</h4>
                </div>
                <div style="margin-left: 20px" v-else>
                  <h4>0</h4>
                </div>
              </div>
            </div>
          </div>
          <br />
          <div v-html="text"></div>
        </div>

        <h2 :style="{ color: userColors?.Diseño?.color }">
          Ruegos y Preguntas
        </h2>
        <div class="notes" v-html="meeting?.note"></div>
        <div v-for="(participant, index) in meeting?.participants" :key="index">
          <div v-if="participant.signature">
            <img :src="participant.url" style="max-width: 50%" />
            <p>{{ participant.name }}</p>
          </div>
        </div>
        {{ finishtime }}
      </div>
    </div>
    <q-btn
      color="inherit"
      :style="{
        backgroundColor: userColors?.Diseño?.color,
        float: 'right',
        margin: '15px',
      }"
      @click="onPDF"
      class="large-button"
    >
      Actas
    </q-btn>
    <q-btn
      color="inherit"
      :style="{
        backgroundColor: userColors?.Diseño?.color,
        float: 'right',
        margin: '15px',
      }"
      @click="buttonfinishtime"
      class="large-button"
    >
      Cerrar Sesion
    </q-btn>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import html2pdf from "html2pdf.js";
import firebase from "firebase/compat/app";
import useMeeting from "src/modules/meetings/composables/useMeeting";
import Swal from "sweetalert2";
import { useQuasar } from "quasar";
import SignatureView from "../components/SignatureView.vue";
import useAuth from "src/modules/auth/composables/useAuth";

export default {
  name: "ListMeeting",
  props: {
    fecha: String,
  },
  components: { SignatureView },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const fecha = computed(() => route.params.fecha);
    const store = useStore();
    const useredit = computed(() => store.getters["authModule/getUserDB"]);
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const timer = ref(null);
    const meeting = ref(null);
    const router = useRouter();
    const timeedit = ref(meeting.value?.time || "");
    const notes = ref(meeting.value?.note || "");
    const orderNote = ref({});
    const indexOrder = ref(null);
    const questionOrder = ref(null);
    const votationOrder = ref({});
    const currentVotation = ref({});
    const showDelegations = ref({});
    const card = ref(false);
    const votes = ref([{ text: "" }]);
    const activeNotify = ref(false);
    const { saveMeetingVotes, saveIsVoted } = useMeeting();
    const selectedOption = ref(null);
    const options = ref([]);
    const cardVotation = ref(false);
    const routeParams = router.currentRoute.value.params;
    const isNotified = ref(false);
    const isActived = ref(false);
    const { loadHeaderActs } = useAuth();
    const notesHeaders = ref("");
    const year = computed(() => new Date(meeting.value.date).getFullYear());
    const month = computed(() =>
      monthName(new Date(meeting.value.date).getMonth())
    );
    const number = computed(() => new Date(meeting.value.date).getDate());
    const openingSession = ref("");
    const finishtime = ref();

    const cardSignature = ref(false);

    const openModal2 = () => {
      cardSignature.value = true;
    };

    const handleCloseCard = () => {
      cardSignature.value = false;
    };
    const alerts = [
      {
        color: "purple",
        message: "Notificación de votación disponible",
        icon: "warning",
      },
    ];

    const monthName = (monthIndex) => {
      const months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      return months[monthIndex];
    };

    const toggleDelegations = (name) => {
      showDelegations.value[name] = !showDelegations.value[name];
    };

    const loadHeadersAct = async (typeMeeting) => {
      let processedContent;
      const loadedHeaders = await loadHeaderActs();
      if (loadedHeaders) {
        Object.keys(loadedHeaders).forEach((key) => {
          const header = loadedHeaders[key];
          if (header.type === "openingSession") {
            openingSession.value = header.notes;
          }
          if (header.name === typeMeeting) {
            notesHeaders.value = header.notes;
            processedContent = notesHeaders.value
              .replace(/{{\s*meeting.time\s*}}/g, meeting?.value.time)
              .replace(/{{\s*number\s*}}/g, number.value)
              .replace(/{{\s*month\s*}}/g, month.value)
              .replace(/{{\s*year\s*}}/g, year.value)
              .replace(/{{\s*formattedTime\s*}}/g, formattedTime.value);
            notesHeaders.value = processedContent;
          }
        });
      }
    };

    const save = async () => {
      console.log("Esta GUARDANDO se ejecuta cada 5 segundos");

      const originalMeeting = meeting.value;
      const meetingFromDatabase = await store.dispatch(
        "authModule/loadMeetinglive",
        fecha.value
      );
      const meetingCopy = { ...meeting.value };

      for (const userId in originalMeeting.participants) {
        if (meetingFromDatabase.participants[userId]) {
          meetingCopy.participants[userId].url =
            meetingFromDatabase.participants[userId].url;
        }
      }

      for (const userId in originalMeeting.participants) {
        if (meetingFromDatabase.participants[userId]) {
          meetingCopy.participants[userId].isVoted =
            meetingFromDatabase.participants[userId].isVoted;
        }
      }

      let originalVotation;
      Object.keys(meetingCopy.votation).forEach((key) => {
        const votation = meetingFromDatabase.votation[key];
        originalVotation = meetingCopy.votation[key];
        console.log("votation.options:", votation.options);
        console.log("originalVotation.options:", originalVotation.options);

        if (
          votation.options &&
          originalVotation.options &&
          votation.options.length === originalVotation.options.length
        ) {
          console.log("Actualizando opciones de votación:");
          originalVotation.options.forEach((option, index) => {
            option.numVotes = votation.options[index].numVotes;
          });
          console.log(
            "Opciones de votación actualizadas:",
            originalVotation.options
          );

          options.value = originalVotation.options;
        }
      });

      await store.dispatch("authModule/saveMeetinglive", meetingCopy);
    };

    const load = async () => {
      console.log("Esta CARGANDO se ejecuta cada 5 segundos");
      meeting.value = await store.dispatch(
        "authModule/loadMeetinglive",
        fecha.value
      );
      await activateNotify();
    };

    const formattedTime = computed(() => {
      if (!meeting?.value?.time) return "";
      const [hours, minutes] = meeting?.value?.time.split(":").map(Number);
      const newMinutes = (minutes + 30) % 60;
      const newHours = hours + (Math.floor((minutes + 30) / 60) % 24);
      const formattedHours = String(newHours).padStart(2, "0");
      const formattedMinutes = String(newMinutes).padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}`;
    });

    const endEdit = async () => {
      meeting.value.edit = { active: false, usercanedit: useredit.value };
      console.log(useredit.value.id);
      await store.dispatch("authModule/saveMeetinglive", meeting.value);
    };
    const updateFormattedTime = (event) => {
      meeting.value.time = event.target.value;
    };

    const updateFormattedNote = (content) => {
      meeting.value.note = notes;
    };
    const updateFormattedOrder = (order, newValue) => {
      orderNote.value[order] = newValue;
      meeting.value.ordernotes[order] = newValue;
    };

    const onPDF = async () => {
      meeting.value.edit.active = true;
      if (meeting.value.edit.active) {
        const elementToConvert = document.getElementById("element-to-pdf");

        let opt = {
          margin: 1,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        if (elementToConvert) {
          try {
            console.log("0");
            const pdfBlob = await html2pdf()
              .from(elementToConvert)
              .set(opt)
              .toPdf()
              .output("arraybuffer");
            const storageRef = firebase.storage().ref();
            const pdfRef = storageRef
              .child("actas")
              .child(meeting.value.type+"-"+meeting.value.date + ".pdf");
            console.log("1");
            await pdfRef.put(pdfBlob, { contentType: "application/pdf" });
            console.log("2");
            const pdfDownloadURL = await pdfRef.getDownloadURL();
            console.log("URL de descarga del PDF:", pdfDownloadURL);
            console.log("3");
            await guardarURLenFirebase(pdfDownloadURL);
            console.log("4");

            const meetingCopy = JSON.parse(JSON.stringify(meeting.value));
            for (const key in meetingCopy.participants) {
              if (Object.hasOwnProperty.call(meetingCopy.participants, key)) {
                delete meetingCopy.participants[key].url;
              }
            }
            await store.dispatch("authModule/saveMeetinglive", meetingCopy);
          } catch (error) {
            console.error("Error al generar o subir el PDF:", error);
          }
        } else {
          console.error(
            "No se pudo encontrar el elemento para convertir a PDF"
          );
        }
      }
    };

    const guardarURLenFirebase = async (pdfDownloadURL) => {
      try {
        await store.dispatch("authModule/saveActa", pdfDownloadURL);
        console.log("URL de descarga del PDF guardada en Firebase");
      } catch (error) {
        console.error("Error al guardar la URL del PDF en Firebase:", error);
      }
    };

    const openModal = (name) => {
      indexOrder.value = name;
      meeting.value.votation[name] = { active: false };
      card.value = true;
    };

    const countVotedParticipants = () => {
      let countVoted = 0;
      Object.keys(meeting.value.participants).forEach((participantId) => {
        const participant = meeting.value.participants[participantId];
        if (participant.isVoted) {
          countVoted++;
        }
        if (participant.delegations) {
          Object.keys(participant.delegations).forEach((del) => {
            const delegation = participant.delegations[del];
            if (delegation.isVoted) {
              countVoted++;
            }
          });
        }
      });
      return countVoted;
    };

    const countTotalParticipants = () => {
      let counterTotal = 0;
      Object.keys(meeting.value.participants).forEach((participantId) => {
        const participant = meeting.value.participants[participantId];
        if (participant.active && participant.delegations) {
          counterTotal += Object.keys(participant.delegations).length;
        }
      });
      return Object.keys(meeting.value.participants).length + counterTotal;
    };

    const finishVotation = async () => {
      Object.keys(meeting.value.participants).forEach((participantId) => {
        const participant = meeting.value.participants[participantId];
        if (participant.isVoted) {
          participant.isVoted = false;
        }

        if (participant.delegations) {
          Object.keys(participant.delegations).forEach((del) => {
            const delegation = participant.delegations[del];
            if (delegation.isVoted) {
              delegation.isVoted = false;
            }
          });
        }
      });
      for (const name in meeting.value.votation) {
        if (name === indexOrder.value) {
          const currentVotation = meeting.value.votation[name];
          currentVotation.active = false;
          isActived.value = currentVotation.active;
        }
      }
      await store.dispatch("authModule/saveMeetinglive", meeting.value);
    };

    const buttonfinishtime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      finishtime.value = `${hours}:${minutes}`;
    };

    onMounted(async () => {
      meeting.value = await store.dispatch(
        "authModule/loadMeetinglive",
        fecha.value
      );
      if (meeting.value && meeting.value.ordernotes) {
        Object.keys(meeting.value.votation).forEach((name) => {
          if (meeting.value.votation[name].active) {
            indexOrder.value = name;
            activeNotify.value = meeting.value.votation[name].active;
          }
        });
        await loadHeadersAct(meeting.value?.type);

        notes.value = meeting.value?.note;
        timeedit.value = meeting.value?.time;

        if (Array.isArray(meeting.value.ordernotes)) {
          meeting.value.ordernotes.forEach((order) => {
            orderNote.value[order] = meeting.value?.ordernotes[order];
          });
        } else if (typeof meeting.value.ordernotes === "object") {
          Object.keys(meeting.value.ordernotes).forEach((order) => {
            orderNote.value[order] = meeting.value?.ordernotes[order];
          });

          Object.keys(meeting.value.votation).forEach((name) => {
            votationOrder.value[name] = meeting.value?.votation[name];
            currentVotation.value = meeting.value?.votation[name];
          });
        }
      }

      timer.value = setInterval(() => {
        if (!timer.value) return;
        if (meeting.value.edit.usercanedit.id != useredit.value.id) {
          load();
        } else {
          save();
        }
      }, 5000);
    });

    onUnmounted(() => {
      clearInterval(timer.value);
    });

    const addVote = () => {
      votes.value.push({ text: "" });
    };

    const deleteVote = (index) => {
      if (votes.value.length > 2) {
        votes.value.splice(index, 1);
      }
    };

    const onSendVotation = async () => {
      try {
        options.value = [];
        Object.keys(meeting.value.votation).forEach((name) => {
          if (name === indexOrder.value) {
            const currentVotation = meeting.value.votation[name];
            votes.value.forEach((vote) => {
              if (vote && vote.text) {
                options.value.push({ text: vote.text });
              }
            });
            currentVotation.question = questionOrder.value;
            currentVotation.options = options.value;
            currentVotation.active = true;
            isActived.value = currentVotation.active;
          } else {
            meeting.value.votation[name].active = false;
          }
        });
        card.value = false;
        isNotified.value = true;
        showNotif("bottom-right");
        resetData();
      } catch (error) {
        console.error("Error in onSendVotation:", error);
      }
    };

    const activateNotify = async () => {
      const participant = meeting?.value.participants[routeParams.id];
      const isVoted = participant.isVoted;
      console.log(activeNotify.value);
      console.log(isVoted);
      if (participant) {
        const userIsActive = participant.active;
        console.log(userIsActive);
        if (activeNotify.value && userIsActive && !isVoted) {
          showNotif("bottom-right");
        }
      }
    };

    const addVotationPerson = async () => {
      let body = {},
        bodyIsVoted = {};
      cardVotation.value = false;
      Swal.fire({
        title: "Quieres votar la opcion " + selectedOption.value + " ?",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: `No`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          Object.keys(meeting.value.votation).forEach((name) => {
            if (meeting.value.votation[name].active) {
              currentVotation.value = meeting.value.votation[name];
            }
          });

          currentVotation.value.options.forEach((option, index) => {
            if (option.text === selectedOption.value) {
              if (
                options.value.find((opt) => opt.text === selectedOption.value)
              ) {
                const participant = meeting?.value.participants[routeParams.id];
                option.numVotes.push(participant);
                console.log("Que esta pasando: ", option.numVotes);
                body = {
                  date: fecha.value,
                  order: indexOrder.value,
                  text: option.text,
                  numVotes: option.numVotes,
                  index: index,
                };
              }
            }
          });
          bodyIsVoted = {
            isVoted: true,
            id: routeParams.id,
            date: fecha.value,
          };
          await saveMeetingVotes(body);
          await saveIsVoted(bodyIsVoted);
          card.value = false;
          Swal.fire("Votación hecha!", "", "success");
        } else if (result.isDenied) {
          cardVotation.value = true;
        }
      });
    };

    const loadOptions = async () => {
      Object.keys(meeting.value.votation).forEach((name) => {
        if (meeting.value.votation[name].active) {
          indexOrder.value = name;
          currentVotation.value = meeting.value.votation[name];
          console.log("El actual voto es: ", currentVotation.value);
        }
      });
      questionOrder.value = currentVotation.value.question;
      if (currentVotation.value && currentVotation.value.options) {
        currentVotation.value.options.forEach((option) => {
          if (!options.value.find((opt) => opt.text === option.text)) {
            options.value.push({ text: option.text, numVotes: [] });
          }
        });
      }
    };

    const showNotif = (position) => {
      const { color, textColor, multiLine, message, avatar } =
        alerts[Math.floor(Math.random(alerts.length) * 10) % alerts.length];
      const buttonColor = color ? "white" : void 0;

      $q.notify({
        color,
        textColor,
        message,
        position,
        avatar,
        multiLine,
        actions: [
          {
            label: "Votar",
            color: buttonColor,
            handler: async () => {
              router.push({
                name: "votations-page",
              });
              await loadOptions();
              cardVotation.value = true;
            },
          },
          {
            label: "Cancelar",
            color: "yellow",
            handler: () => {
              console.log("Dismiss");
            },
          },
        ],
        timeout: 3600000,
      });
    };

    const hasActiveDelegations = (participant) => {
      return Object.values(participant?.delegations || {}).some(
        (delegation) => delegation.active
      );
    };
    // Método para detener el temporizador cuando se hace clic en el botón "Guardar"
    const stopTimer = () => {
      clearInterval(timer.value);
      console.log("Temporizador detenido");
    };

    const resetData = () => {
      votes.value = [{ text: "" }];
      questionOrder.value = "";
    };

    return {
      stopTimer,
      meeting,
      formattedTime,
      updateFormattedTime,
      timeedit,
      orderNote,
      updateFormattedNote,
      notes,
      endEdit,
      useredit,
      showDelegations,
      toggleDelegations,
      hasActiveDelegations,
      updateFormattedOrder,
      userColors,
      onPDF,
      card,
      votes,
      addVote,
      deleteVote,
      onSendVotation,
      openModal,
      indexOrder,
      questionOrder,
      rolDB,
      selectedOption,
      addVotationPerson,
      finishVotation,
      votationOrder,
      options,
      cardVotation,
      isActived,
      openModal2,
      handleCloseCard,
      cardSignature,
      countTotalParticipants,
      countVotedParticipants,
      notesHeaders,
      openingSession,
      finishtime,
      buttonfinishtime,
    };
  },
};
</script>
<style scoped>
.meeting-details {
  padding: 20px;
}

.edit-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.meeting-info {
  margin-bottom: 20px;
}

.date {
  font-size: 16px;
}

.title {
  font-size: 24px;
  margin-bottom: 10px;
}

.time {
  font-size: 18px;
}

.participants {
  margin-bottom: 20px;
}

.participant {
  margin-bottom: 10px;
}

.delegations {
  margin-left: 20px;
}

.order-notes {
  margin-bottom: 20px;
}

.notes {
  margin-bottom: 20px;
}

.button_container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .title {
    font-size: 20px;
  }

  .time {
    font-size: 16px;
  }

  .participant {
    font-size: 14px;
  }
}
</style>