<template>
  <div class="profile-list-container">
    <q-btn
      color="inherit"
      :style="{ backgroundColor: userColors?.Diseño?.color }"
      icon="arrow_back"
      @click="goBack"
      class="buttonback"
    />
    <h1 class="h1withbutton">Configuración</h1>

    <div class="button-grid card" style="width: 90%">
      <div class="button-margin">
        <div class="button-container">
          <q-item
            @click="onVivienda"
            clickable
            class="large-button"
            label="Usuario"
            >Usuario<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <!--
<q-btn v-if="rolDB?.noticias?.leer" @click="onVivienda">
  Vivienda
</button>
-->
        <div class="button-container">
          <q-item
            @click="onActas"
            class="large-button"
            clickable
            label="Vivienda"
          >
            Vivienda<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item @click="onRol" class="large-button" clickable label="Roles">
            Roles<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item
            @click="onConf"
            class="large-button"
            clickable
            label="Secciones"
          >
            Secciones<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item
            @click="onEspacio"
            clickable
            class="large-button"
            label="Espacio"
          >
            Espacio<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item @click="onTema" clickable class="large-button" label="Tema">
            Tema<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item
            @click="onSuppliers"
            clickable
            class="large-button"
            label="Proveedores"
          >
            Proveedores<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
        <div class="button-container">
          <q-item
            @click="onHeadersActs"
            clickable
            class="large-button"
            label="Cabeceras actas"
          >
            Cabeceras actas<q-icon
              name="keyboard_double_arrow_right"
              :style="{ margin: '5px' }"
            />
          </q-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "AdminPage",

  setup() {
    const router = useRouter();
    const store = useStore();

    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const onVivienda = () => {
      router.push({ name: "admin-vivienda" });
    };

    const onActas = async () => {
      let prove = await store.dispatch(
        "authModule/loadMeetinglive",
        "2024-04-21"
      );
      if (prove?.active) {
        console.log("sesion iniciada");
        router.push({
          name: "admin-actas",
          params: {
            fecha: "2024-04-21",
          },
        });
      } else {
        let users = computed(() => store.getters["authModule/getUsersmee"]);
        const allowedRoles = ["admin", "invitado"];

        // Filtra los usuarios que tienen algún rol permitido
        const filteredUsers = users.value.filter((user) =>
          allowedRoles.includes(user.role)
        );

        let meeting = {
          title: "Weekly Meeting",
          active: true,
          date: "2024-04-21",
          time: "10:00",
          edit: { active: true, usercanedit: "" },
          participants: {},
          order: {},
          ordernotes: {},
          note: "",
          signature: [],
        };

        const orderNames = ["orden1", "orden2", "orden3"];
        orderNames.forEach((orderName, index) => {
          meeting.order[orderName] = ""; // Suma 1 al índice para que empiece desde 1 en lugar de 0
          meeting.ordernotes[orderName] = ""; // También asigna el índice a ordernotes
        });

        filteredUsers.forEach((user) => {
          let participant = {
            active: false,
            signature: false,
            name: user.name + " " + user.surname,
            delegations: {},
          };

          // Itera sobre los usuarios para asignar delegaciones
          filteredUsers.forEach((user2) => {
            if (user2.id !== user.id) {
              // Almacenar la delegación por el ID del usuario
              participant.delegations[user2.id] = {
                active: false,
                name: user2.name + " " + user2.surname,
              };
            }
          });

          // Almacenar el participante por su ID
          meeting.participants[user.id] = participant;
        });

        await store.dispatch("authModule/saveMeetinglive", meeting);
        console.log("sesion creada");
        router.push({
          name: "admin-actas",
          params: {
            fecha: meeting.date,
          },
        });
      }
    };
    const onRol = () => {
      router.push({ name: "admin-rol" });
    };

    const onSuppliers = () => {
      router.push({ name: "supply-page" });
    };

    const onHeadersActs = () => {
      router.push({ name: "header-acts" });
    };

    const goBack = () => {
      history.back();
    };

    const onConf = () => {
      router.push({ name: "admin-conf" });
    };
    const onEspacio = () => {
      router.push({ name: "admin-espacio" });
    };

    const onTema = () => {
      router.push({ name: "admin-tema" });
    };

    return {
      onVivienda,
      onActas,
      onRol,
      onConf,
      onEspacio,
      onTema,
      userColors,
      onSuppliers,
      goBack,
      onHeadersActs,
    };
  },
};
</script>

<style scoped>
.profile-list-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra horizontalmente en el eje X */
  text-align: center; /* Centra el texto */
}

.button-container {
  display: flex;
  justify-content: left;
}
.button-margin {
  padding: 30px;
}

.large-button {
  width: 250px;
  height: 40px;
  font-size: 1.2rem;
}
.large-butto2 {
  width: 150px;
  height: 40px;
  font-size: 1.2rem;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>