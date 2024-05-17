<template>
  <div class="q-pa-lg">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <label>Tipo de reunión </label>
      <q-select
        color="teal"
        filled
        v-model="meeting.type"
        :options="options"
        label="Tipo de Reunión"
      >
        <template v-slot:prepend>
          <q-icon name="groups" />
        </template>
      </q-select>

      <div class="d-flex align-center">
        <label style="margin-right: 30px">Órdenes del dia</label>
        <q-btn
          label="Añadir orden"
          type="submit"
          icon="add_circle"
          padding="10px 14px"
          @click="addOrder"
          style="border-radius: 25px"
        />
      </div>
      <ul>
        <div v-for="(order, index) in orders" :key="index">
          <q-input
            filled
            v-model="order.text"
            :placeholder="'Añadir'"
            :rules="[
              (val) => (val && val.length > 0) || 'Este campo es obligatorio',
            ]"
          >
            <template v-slot:prepend>
              <label>{{ index + 1 }}.</label>
            </template>
            <template v-slot:append>
              <q-icon
                name="delete"
                size="sm"
                style="cursor: pointer; color: red"
                @click="deleteOrder(index)"
              />
            </template>
          </q-input>
        </div>
      </ul>
      <div class="q-pa-md">
        <div class="d-flex row">
          <div class="col-lg-6 col-sm-6 col-md-6 col-xs-12">
            <q-date
              v-model="meeting.date"
              mask="YYYY-MM-DD"
              color="green"
              :options="optionsFn"
            />
          </div>
          <br />
          <div class="col-lg-4 col-sm-4 col-md-4 col-xs-12">
            <q-time v-model="meeting.time" mask="HH:mm" color="green" />
          </div>
        </div>
      </div>
      <div class="q-pa-md">
        <div class="q-gutter-sm">
          <q-checkbox
            v-for="(role, index) in roles"
            :key="index"
            v-model="selection"
            :val="index"
            :label="index"
          />
        </div>
      </div>
      <br />
      <div class="row">
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Guardar"
            type="submit"
            :style="{ backgroundColor: userColors?.Diseño?.color }"
            class="q-ml-sm"
            padding="15px"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Borrar"
            type="reset"
            color="red"
            padding="15px"
            class="q-ml-sm"
            @click="onResetMeeting"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
        <div class="col-sm-4 col-md-4 col-xs-4">
          <q-btn
            label="Volver"
            type="reset"
            color="purple"
            padding="15px"
            class="q-ml-sm"
            @click="$router.push({ name: 'meetings-page' })"
            style="border-radius: 25px; font-size: 15px"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>
  
<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useStore } from "vuex";
import useAuth from "src/modules/auth/composables/useAuth";
import useMeeting from "src/modules/meetings/composables/useMeeting";

export default {
  name: "NewMeeting",
  setup() {
    const route = useRouter();
    const store = useStore();
    const { loadHeaderActs } = useAuth();
    const { createMeetingDB } = useMeeting();
    const orders = ref([{ text: "" }]);
    const date = ref(null);
    const time = ref(null);
    const selection = ref([]);
    const options = ref([]);

    const meeting = ref({
      type: "",
      date: date,
      time: time,
      orders: orders.value,
      participants: "",
    });
    const roles = ref([]);
    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );

    const onResetMeeting = async () => {
      meeting.value.type = "";
      date.value = null;
      time.value = null;
      orders.value = [{ text: "" }];
    };

    const addOrder = () => {
      orders.value.push({ text: "" });
    };

    const deleteOrder = (index) => {
      orders.value.splice(index, 1);
    };

    const loadHeadersActs = async () => {
      const loadedHeaders = await loadHeaderActs();
      if (loadedHeaders) {
        Object.keys(loadedHeaders).forEach((key) => {
          const header = loadedHeaders[key];
          options.value.push(header.name);
        });
      }
      console.log(options.value);
    };

    onMounted(async () => {
      await getRoles();
      await loadHeadersActs();
    });

    const getRoles = async () => {
      roles.value = await store.dispatch("authModule/getRolesFromDatabase");
    };

    const updateOrderText = (value, index) => {
      orders.value[index].text = value;
    };

    const onSubmit = async () => {
      try {
        meeting.value.participants = selection.value;
        if (
          meeting.value.type === null ||
          date.value === null ||
          time.value === null
        ) {
          throw new Error("Por favor, complete todos los campos");
        }
        await createMeetingDB(meeting.value);
        Swal.fire(
          "La reunión se ha creado",
          "Reunión creada con éxito",
          "success"
        );
        route.push({
          name: "meetings-page",
        });
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };
    const currentDate = new Date();

    return {
      options,
      meeting,
      orders,
      date,
      time,
      selection,
      optionsFn(date) {
        return (
          date >=
          currentDate.getFullYear() +
            "/" +
            (currentDate.getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            currentDate.getDate().toString().padStart(2, "0")
        );
      },
      onResetMeeting,
      onSubmit,
      userColors,
      roles,
      addOrder,
      deleteOrder,
      updateOrderText,
    };
  },
};
</script>
  
<style lang="scss" scoped>
.full-width.with-border {
  border: 1px solid lightslategray;
  border-radius: 5px;
  padding: 8px;
}

.full-width.with-border:hover {
  border: 1px solid black;
  padding: 8px;
}

.date-time-inputs {
  width: 100%;
}

.image-container {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
}
.align-center {
  display: flex;
  align-items: center;
}

.camera-icon img {
  width: 10px;
  height: 50px;
}

.custom-btn {
  background-color: #03066a;
  font-weight: bold;
  color: #fff;
  border: none;
  font-size: 16px;
  border-radius: 12px;
  cursor: pointer;
  width: 140px;
  height: 60px;
}

.custom-btn:hover {
  background-color: #0c1d37;
}

.d-flex {
  display: flex;
}

.justify-center {
  margin: 0px auto;
}

.profile-picture {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture img {
  width: 280px;
  height: 275px;
  object-fit: cover;
  border-radius: 30px;
  border: 2px solid darkblue;
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