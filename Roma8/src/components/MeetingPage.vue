<template>
  <div class="meeting-container">
    <div class="d-column align-center">
      <span class="day-number text-success fs-8 fw-bold mr-2">{{ day }}</span>
      <div class="date-info">
        <span class="fs-14 text-uppercase fw-lighter mx-1"
          >{{ number }} de {{ month }} {{ year }}</span
        >
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-md-6 col-sm-6 col-xs-5 q-mx-xs">
        <div class="meeting-title fs-14">{{ meeting.type }}</div>
        <div class="meeting-title fs-14">{{ meeting.title }}</div>
      </div>
      <div class="col-md-2 col-sm-2 col-xs-2 q-mx-xs">
        <div class="meeting-hour fs-14">{{ meeting.time }}</div>
      </div>
      <div class="col-md-2 col-sm-2 col-xs-2 q-mx-xs">
        <div class="d-flex align-center">
          <q-icon name="visibility" class="fs-32" @click="card = true" />
        </div>
      </div>
      <div class="col-md-1 col-sm-1 col-xs-1">
        <div class="d-flex align-center">
          <q-icon
            type="submit"
            v-if="
              rolDB?.unirseReunion &&
              meet?.assistants?.[`${useredit?.id}`]?.active &&
              !meet?.assistants?.[`${useredit?.id}`]?.delego
            "
            v-show="showButton"
            @click="onLive"
            style="font-size: 30px"
            name="meeting_room"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-2 col-sm-12 col-xs-12">
        <q-btn
          v-if="
            !meet?.assistants?.[`${useredit?.id}`]?.active &&
            !meet?.assistants?.[`${useredit?.id}`]?.delego
          "
          @click="assistMeeting(meeting.id)"
          :style="{
            margin: '5px',
          }"
          color="primary"
          label="Asistir"
        />
        <q-btn
          v-if="
            meet?.assistants?.[`${useredit?.id}`]?.active && havedelegations
          "
          @click="NotAssistMeeting(meeting.id)"
          :style="{
            margin: '5px',
          }"
          color="primary"
          label="Quitar asistir"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <q-btn-dropdown
          color="primary"
          :style="{
            margin: '5px',
          }"
          v-if="
            !meet?.assistants?.[`${useredit?.id}`]?.active &&
            !meet?.assistants?.[`${useredit?.id}`]?.delego
          "
          label="Delegaciones"
        >
          <q-list>
            <q-item
              v-for="del in delegations"
              :key="del.name"
              clickable
              v-close-popup
              @click="onItemClick(del, meeting.id)"
            >
              <q-item-section>
                <q-item-label>{{ del }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          v-if="meet?.assistants?.[`${useredit?.id}`]?.delego"
          @click="
            NotDelegation(
              meeting.id,
              meet.assistants,
              meet.assistants?.[`${useredit?.id}`]?.delego
            )
          "
          color="primary"
          :style="{
            margin: '5px',
          }"
          label="quitar delegacion"
        />
      </div>
    </div>

    <q-infinite-scroll :offset="350">
      <q-dialog v-model="card" @show="loadMeetingState" persistent>
        <q-card class="my-card">
          <q-card-section class="q-pa-md">
            <div class="row">
              <div class="col">
                <div
                  class="text-h6"
                  style="font-weight: bold; overflow-wrap: break-word"
                >
                  {{ meeting.title }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn v-close-popup flat dense icon="close" class="q-ml-md" />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none" style="max-height: 80vh">
            <div class="row d-flex align-center">
              <q-icon name="event" class="fs-22" style="margin-right: 10px" />
              {{ number }} de {{ month }}, {{ year }}
            </div>
            <br />
            <div
              class="text-h7 d-flex"
              style="margin-bottom: 10px; overflow-wrap: break-word"
            >
              <q-icon name="task" class="fs-23" style="margin-right: 10px" />
              Orden del día:
            </div>
            <div class="text-subtitle1">
              <ul>
                <li v-for="(order, index) in meeting.orders" :key="index">
                  {{ index + 1 }}. {{ order.text }}
                </li>
              </ul>
            </div>
            <br />
            <div class="text-participants">
              <div class="text-h7 d-flex" style="margin-bottom: 10px">
                <q-icon
                  name="groups"
                  class="fs-23"
                  style="margin-right: 10px"
                />
                Invitados:
              </div>
              <ul>
                <li
                  v-for="(participant, index) in sortedRolsUsers"
                  :key="index"
                >
                  &bull; {{ participant.name }} {{ participant.surname }}
                </li>
              </ul>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-infinite-scroll>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import useMeeting from "src/modules/meetings/composables/useMeeting";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "MeetingPage",
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { createMeetingState, saveAssistants, updateAssistants } =
      useMeeting();
    const store = useStore();
    const rolDB = computed(() => store.getters["authModule/getRolDB"]);
    const userState = computed(() => store.getters["authModule/getUserDB"]);
    const router = useRouter();

    const month = computed(() =>
      monthName(new Date(props.meeting.date).getMonth())
    );
    let useredit = computed(() => store.getters["authModule/getUserDB"]);
    const today = ref(new Date().toISOString().split("T")[0]);
    const year = computed(() => new Date(props.meeting.date).getFullYear());
    const day = computed(() => dayName(new Date(props.meeting.date).getDay()));
    const number = computed(() => new Date(props.meeting.date).getDate());
    const showButton = ref(false);
    const assistUser = ref(false);
    const card = ref(false);
    const rolsUsers = ref([]);
    const users = computed(() => store.getters["authModule/getUsersmee"]);
    const delegations = ref({});
    const indexDelegation = ref(null);
    const indexAssistant = ref(null);
    const havedelegations = ref(true);
    const assist = ref(false);
    const sortedRolsUsers = computed(() =>
      rolsUsers.value.slice().sort((a, b) => a.surname.localeCompare(b.surname))
    );
    const userMatch = ref(false);

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

    const joinAssistants = async (meetingId) => {
      let participants = {};
      const newDelegations = [];

      const allowedRoles = [];
      for (const key in props.meeting.participants) {
        if (props.meeting.participants.hasOwnProperty(key)) {
          allowedRoles.push(props.meeting.participants[key]);
        }
      }

      const filteredUsers = users?.value?.filter((user) =>
        allowedRoles.includes(user.role)
      );

      const assistants = props.meeting.assistants;
      if (assistants) {
        Object.keys(assistants).forEach((key) => {
          const user = assistants[key];
          if (key === userState.value.id) {
            userMatch.value = true;
          }

          Object.keys(user.delegations).forEach((delegationKey) => {
            const delegation = user.delegations[delegationKey];
            if (delegation.active && userState.value.id === user.id) {
              user.delegations[delegationKey] = {
                active: true,
                name: delegation.name,
              };
            }
          });
        });

        if (!userMatch.value) {
          filteredUsers.forEach((user) => {
            if (userState.value.id === user.id) {
              let participant = {
                active: false,
                name: user.name + " " + user.surname,
                delegations: {},
              };
              assist.value = participant.active;

              // Itera sobre los usuarios para asignar delegaciones
              filteredUsers.forEach((user2) => {
                if (user2.id !== user.id) {
                  participant.delegations[user2.id] = {
                    active: false,
                    name: user2.name + " " + user2.surname,
                  };
                }
              });
              participants[user.id] = participant;
              console.log("ayudaaaa 1");
              delegations.value = participant.delegations;
            }
          });
        } else {
          Object.keys(assistants).forEach((key) => {
            const user = assistants[key];
            if (key === userState.value.id) {
              Object.keys(user.delegations).forEach((delegationKey) => {
                if (!user.active) {
                  const delegation = user.delegations[delegationKey];
                  newDelegations.push(delegation.name);
                }
              });
              console.log("ayudaaaa 2");
              delegations.value = newDelegations;
            }
          });
        }
      } else {
        if (meetingId) {
          const allowedRoles = [];
          for (const key in props.meeting.participants) {
            if (props.meeting.participants.hasOwnProperty(key)) {
              allowedRoles.push(props.meeting.participants[key]);
            }
          }
          const filteredUsers = users?.value?.filter((user) =>
            allowedRoles.includes(user.role)
          );

          filteredUsers.forEach((user) => {
            if (userState.value.id === user.id) {
              let participant = {
                active: false,
                name: user.name + " " + user.surname,
                delegations: {},
              };
              assist.value = participant.active;

              // Itera sobre los usuarios para asignar delegaciones
              filteredUsers.forEach((user2) => {
                if (user2.id !== user.id) {
                  participant.delegations[user2.id] = {
                    active: false,
                    name: user2.name + " " + user2.surname,
                  };
                }
              });
              participants[user.id] = participant;
              delegations.value = participant.delegations;
            }
          });
        }
      }
      delegations.value = newDelegations;
      await saveAssistants(meetingId, participants);
      console.log("Asistentes añadidos a la lista");
    };

    const assistMeeting = async (meetingId) => {
      let participants = {};
      const meetingDate = new Date(props.meeting.date)
        .toISOString()
        .split("T")[0];

      if (meetingId) {
        const allowedRoles = [];
        for (const key in props.meeting.participants) {
          if (props.meeting.participants.hasOwnProperty(key)) {
            allowedRoles.push(props.meeting.participants[key]);
          }
        }
        const filteredUsers = users?.value?.filter((user) =>
          allowedRoles.includes(user.role)
        );

        filteredUsers.forEach((user) => {
          if (userState.value.id === user.id) {
            let participant = {
              active: true,
              name: user.name + " " + user.surname,
              delegations: {},
            };
            assist.value = participant.active;

            // Itera sobre los usuarios para asignar delegaciones
            filteredUsers.forEach((user2) => {
              if (user2.id !== user.id) {
                participant.delegations[user2.id] = {
                  active: false,
                  name: user2.name + " " + user2.surname,
                };
              }
            });
            participants[user.id] = participant;
          }
        });

        await saveAssistants(meetingId, participants);
        console.log("Asistentes añadidos a la lista");
        await getMeeting(props.meeting.id);
      }
    };

    const NotAssistMeeting = async (meetingId) => {
      let participants = {};
      const meetingDate = new Date(props.meeting.date)
        .toISOString()
        .split("T")[0];

      if (meetingId) {
        const allowedRoles = [];
        for (const key in props.meeting.participants) {
          if (props.meeting.participants.hasOwnProperty(key)) {
            allowedRoles.push(props.meeting.participants[key]);
          }
        }
        const filteredUsers = users?.value.filter((user) =>
          allowedRoles.includes(user.role)
        );

        filteredUsers.forEach((user) => {
          if (userState.value.id === user.id) {
            let participant = {
              active: false,
              name: user.name + " " + user.surname,
              delegations: {},
            };
            assist.value = participant.active;

            // Itera sobre los usuarios para asignar delegaciones
            filteredUsers.forEach((user2) => {
              if (user2.id !== user.id) {
                participant.delegations[user2.id] = {
                  active: false,
                  name: user2.name + " " + user2.surname,
                };
              }
            });
            participants[user.id] = participant;
          }
        });

        await saveAssistants(meetingId, participants);
        console.log("Asistentes añadidos a la lista");
        await getMeeting(props.meeting.id);
      }
    };

    const NotDelegation = async (meetingId, id, iddelego) => {
      let payload = {
        meeid: meetingId,
        id: Object.keys(id).find((key) => key === useredit?.value.id),
        iddelego: iddelego,
      };
      console.log(payload);
      await store.dispatch("authModule/deleteDelegation", payload);
      await getMeeting(props.meeting.id);
    };

    const onItemClick = async (clickedDelegation, meetingId) => {
      const assistants = props.meeting.assistants;
      console.log(clickedDelegation);

      Object.keys(assistants).forEach((key) => {
        const user = assistants[key];
        if (key === userState.value.id) {
          indexAssistant.value = key;
          console.log(indexAssistant.value);
          Object.keys(user.delegations).forEach((delegationKey) => {
            const delegation = user.delegations[delegationKey];
            if (delegation.name === clickedDelegation) {
              indexDelegation.value = delegationKey;
            }
          });
        }
      });

      await updateAssistants(
        meetingId,
        indexDelegation.value,
        indexAssistant.value
      );
      await getMeeting(props.meeting.id);
    };

    const usersParticipants = async () => {
      let users = computed(() => store.getters["authModule/getUsersmee"]);

      // Obtiene el valor actual de la computación reactiva
      const usersArray = users.value;

      for (const key in props.meeting.participants) {
        if (props.meeting.participants.hasOwnProperty(key)) {
          rolsUsers.value.push(props.meeting.participants[key]);
        }
      }

      // Filtra los usuarios que tienen algún rol permitido
      const filteredUsers = usersArray.filter((user) =>
        rolsUsers.value.includes(user.role)
      );

      rolsUsers.value = filteredUsers;
    };

    const onLive = async () => {
      let prove = await store.dispatch(
        "authModule/loadMeetinglive",
        props.meeting.date
      );
      if (prove?.active) {
        console.log("sesion iniciada");
        router.push({
          name: "live-meeting",
          params: {
            fecha: props.meeting.date,
          },
        });
      } else {
        let meetingg = await store.dispatch(
          "authModule/getMeeting",
          props.meeting.id
        );
        const allowedRoles = [];
        for (const key in meetingg.participants) {
          if (meetingg.participants.hasOwnProperty(key)) {
            allowedRoles.push(meetingg.participants[key]);
          }
        }

        let meeting = {
          type: meetingg.type,
          active: true,
          date: meetingg.date,
          time: meetingg.time,
          edit: { active: true, usercanedit: "" },
          participants: {},
          votation: {},
          ordernotes: {},
          note: "",
          signature: [],
        };

        // Asigna nombres de órdenes al objeto order y ordernotes
        const orderNames = [];
        for (const category of meetingg.orders) {
          orderNames.push(category.text);
        }
        orderNames.forEach((orderName, index) => {
          //meeting.votation.push({ [orderName]: { active: false, options: [] } });
          meeting.votation[`${index + 1}-${orderName}`] = { active: false };
          meeting.ordernotes[`${index + 1}-${orderName}`] = "";
        });
        console.log(users.value);
        const assistants = meetingg.assistants;
        if (typeof assistants === "object" && assistants !== null) {
          // Iterar sobre las claves del objeto
          Object.keys(assistants).forEach((key) => {
            const user = assistants[key];
            if (user.active) {
              let participant = {
                active: false,
                signature: false,
                isVoted: false,
                name: user.name,
                delegations: {},
              };
              // Iterar sobre las claves de las delegaciones del usuario
              Object.keys(user.delegations).forEach((delegationKey) => {
                const delegation = user.delegations[delegationKey];
                console.log("delegaciones id: ", delegationKey);
                if (delegation.active) {
                  participant.delegations[delegationKey] = {
                    active: true,
                    isVoted: false,
                    name: delegation.name,
                  };
                }
              });
              meeting.participants[key] = participant;
            }
          });
        }
        await store.dispatch("authModule/saveMeetinglive", meeting);
        console.log("sesion creada");
        router.push({
          name: "live-meeting",
          params: {
            fecha: meeting.date,
          },
        });
      }
    };

    const dayName = (dayIndex) => {
      const days = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];
      return days[dayIndex];
    };

    const buttonJoinMeeting = () => {
      try {
        const currentDate = new Date();
        const meetingDate = new Date(props.meeting.date);

        if (
          currentDate.getFullYear() === meetingDate.getFullYear() &&
          currentDate.getMonth() === meetingDate.getMonth() &&
          currentDate.getDate() === meetingDate.getDate()
        ) {
          showButton.value = true;
          return showButton;
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };

    const loadMeetingState = () => {
      createMeetingState(props.meeting);
    };
    const meet = ref({});
    const getMeeting = async (id) => {
      meet.value = await store.dispatch("authModule/getMeeting", id);
    };

    const Delegationsss = async () => {
      const assistantNames = [];

      // Verifica si 'assistants' está definido y no es nulo
      if (meet?.value?.assistants) {
        Object.keys(meet.value.assistants).forEach((key) => {
          const assist = meet.value.assistants[key];
          if (assist?.active) {
            if (key !== useredit?.value?.id) {
              assistantNames.push(assist?.name);
            }
          }
        });
      }

      delegations.value = assistantNames;
    };

    const haveDelegation = async () => {
      const assistantNames = [];

      // Verifica si meet.value.assistants y sus propiedades existen
      if (
        meet.value &&
        meet.value.assistants &&
        meet.value.assistants[useredit.value.id] &&
        meet.value.assistants[useredit.value.id].delegations
      ) {
        Object.keys(
          meet.value.assistants[useredit.value.id].delegations
        ).forEach((key) => {
          const assist =
            meet.value.assistants[useredit.value.id].delegations[key];
          if (assist.active) {
            havedelegations.value = false;
          }
        });
      }
    };

    onMounted(async () => {
      await getMeeting(props.meeting.id);
      buttonJoinMeeting();
      await usersParticipants();
      await joinAssistants(props.meeting.id);
      await Delegationsss();
      await haveDelegation();
    });

    return {
      month,
      day,
      number,
      year,
      buttonJoinMeeting,
      showButton,
      loadMeetingState,
      rolsUsers,
      sortedRolsUsers,
      card,
      onLive,
      rolDB,
      today,
      joinAssistants,
      delegations,
      assist,
      assistUser,
      onItemClick,
      assistMeeting,
      meet,
      useredit,
      NotAssistMeeting,
      NotDelegation,
      havedelegations,
    };
  },
};
</script>

<style lang="scss" scoped>
.meeting-container {
  margin-bottom: 13px;
  margin-top: 10px;
  align-items: center;

  .meeting-hour {
    display: flex;
    align-items: center;
  }

  .date-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
  }

  @media only screen and (min-width: 768px) {
    .meeting-container {
      flex-direction: row;
    }

    .date-info {
      flex-direction: row;
    }
  }
}

.day-number {
  background-color: #4caf50;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 15px;
}
.my-card {
  width: 100%;
  height: 50%;
}
</style>
