<template>
  <q-page class="q-pa-md">
    <q-btn
      color="inherit"
      :style="{
        backgroundColor: userColors?.Diseño?.color,
      }"
      icon="arrow_back"
      class="buttonback"
      @click="$router.push({ name: 'admin-page' })"
    />
    <h1 class="h1withbutton">Roles</h1>
    <div class="q-gutter-md">
      <!-- Sección de Crear Rol -->
      <q-card class="q-mb-md carduser">
        <q-card-section>
          <h2 v-if="!editingRole" class="text-h6">Crear Rol</h2>
          <h2 v-if="editingRole" class="text-h6">Editar Rol</h2>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newRole" label="Nombre de Rol" outlined />
          <div v-for="(section, index) in sections" :key="index">
            <h3 class="text-subtitle">{{ section }}</h3>
            <div class="row">
              <div class="col-md-3 col-6">
                <q-checkbox
                  v-model="permissions[section].crear"
                  label="Crear"
                />
              </div>
              <div class="col-md-3 col-6">
                <q-checkbox v-model="permissions[section].leer" label="Leer" />
              </div>
              <div class="col-md-3 col-6">
                <q-checkbox
                  v-model="permissions[section].actualizar"
                  label="Actualizar"
                />
              </div>
              <div class="col-md-3 col-6">
                <q-checkbox
                  v-model="permissions[section].eliminar"
                  label="Eliminar"
                />
              </div>
            </div>
          </div>
          <h3 class="text-subtitle">Administrar</h3>
          <q-checkbox
            v-model="permissions.admin"
            label="Administrador"
            @click="toggleAdminPermissions"
          />
          <h3 class="text-subtitle">Recibir Correos</h3>
          <q-checkbox v-model="permissions.email" label="Recibir Correos" />
          <h3 class="text-subtitle">Unirse a Reunión</h3>
          <q-checkbox
            v-model="permissions.unirseReunion"
            label="Unirse a Reunión"
          />
          <h3 class="text-subtitle">Editar Reunión</h3>
          <q-checkbox
            v-model="permissions.editarReunion"
            label="Editar Reunión"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="!editingRole"
            :disable="newRole.trim() === ''"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Crear"
            @click="saveRoles"
          />
          <!-- Mostrar botón de Guardar cuando se está editando un rol -->
          <q-btn
            v-if="editingRole"
            :disable="newRole.trim() === ''"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Guardar"
            @click="updateRole"
          />
          <q-btn
            v-if="editingRole"
            color="inherit"
            :style="{
              backgroundColor: userColors?.Diseño?.color,
            }"
            label="Cancelar"
            @click="cancel"
          />
        </q-card-actions>
      </q-card>

      <div class="roles-list">
        <h2 class="text-h6">Lista de Roles</h2>
        <div
          v-for="(role, roleName) in roles"
          :key="roleName"
          class="role carduser"
        >
          <div class="role-info">
            <div class="role-header">
              <h3>{{ roleName }}</h3>
              <q-icon
                :name="
                  showDelegations[roleName] ? 'expand_less' : 'expand_more'
                "
                style="font-size: 30px"
                @click="toggleDelegations(roleName)"
              ></q-icon>
            </div>
            <div class="permission" v-if="showDelegations[roleName]">
              <ul>
                <li
                  v-for="(permissions, permissionName) in role"
                  :key="permissionName"
                >
                  <strong
                    v-if="
                      permissionName === 'admin' ||
                      permissionName === 'email' ||
                      permissionName === 'unirseReunion' ||
                      permissionName === 'editarReunion'
                    "
                    >{{ permissionName }}:
                    {{ permissions ? "true" : "false" }}</strong
                  >

                  <template v-else>
                    <strong>{{ permissionName }}</strong
                    >:
                    <ul>
                      <li v-for="(value, name) in permissions" :key="name">
                        {{ name }}: {{ value ? "true" : "false" }}
                      </li>
                    </ul>
                  </template>
                </li>
              </ul>
              <div style="display: flex; justify-content: flex-end">
                <q-btn
                  color="inherit"
                  :style="{
                    backgroundColor: userColors?.Diseño?.color,
                    margin: '5px',
                  }"
                  label="Editar"
                  @click="editRole(role, roleName)"
                />
                <q-btn
                  color="inherit"
                  :style="{
                    backgroundColor: userColors?.Diseño?.color,
                    margin: '5px',
                  }"
                  label="Eliminar"
                  @click="deleteRole(roleName)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>


<script>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "AdminConfig",
  setup() {
    const newRole = ref("");
    const oldRole = ref("");
    const roles = ref([]);
    const showDelegations = ref({});
    const permissions = ref({
      noticias: {
        crear: false,
        leer: false,
        actualizar: false,
        eliminar: false,
      },
      incidencias: {
        crear: false,
        leer: false,
        actualizar: false,
        eliminar: false,
      },
      sugerencias: {
        crear: false,
        leer: false,
        actualizar: false,
        eliminar: false,
      },
      admin: false,
      email: false,
      asistirReunion: false,
      unirseReunion: false,
      editarReunion: false,
    });

    const userColors = computed(
      () => store.getters["authModule/getUserColors"]
    );
    const sections = ["noticias", "incidencias", "sugerencias"];
    const store = useStore();

    const saveRoles = async () => {
      const payload = {
        roleName: newRole.value,
        permissions: permissions.value,
      };
      await store.dispatch("authModule/saveRoles", payload);
      newRole.value = "";
      permissions.value = {
        noticias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        incidencias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        sugerencias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        admin: false,
        email: false,
        unirseReunion: false,
        editarReunion: false,
      };

      const rol = computed(() => store.getters["authModule/getRol"]);
      roles.value = rol.value;
    };

    const getRoles = async () => {
      roles.value = await store.dispatch("authModule/getRolesFromDatabase");
    };

    const deleteRole = async (roleName) => {
      try {
        await store.dispatch("authModule/deleteRole", roleName);
        const rol = computed(() => store.getters["authModule/getRol"]);
        roles.value = rol.value;
      } catch (error) {
        console.error("Error deleting the role:", error);
      }
    };

    const toggleDelegations = (name) => {
      showDelegations.value[name] = !showDelegations.value[name];
    };
    const toggleAdminPermissions = () => {
      if (permissions.value.admin) {
        for (const section in permissions.value) {
          if (
            section !== "admin" &&
            typeof permissions.value[section] === "object"
          ) {
            permissions.value[section].crear = true;
            permissions.value[section].leer = true;
            permissions.value[section].actualizar = true;
            permissions.value[section].eliminar = true;
          }
        }
      } else {
        for (const section in permissions.value) {
          if (
            section !== "admin" &&
            typeof permissions.value[section] === "object"
          ) {
            permissions.value[section].crear = false;
            permissions.value[section].leer = false;
            permissions.value[section].actualizar = false;
            permissions.value[section].eliminar = false;
          }
        }
      }
    };

    const selectedRole = ref("");
    const editingRole = ref(false);
    const editRole = (role, roleName) => {
      newRole.value = roleName;
      editingRole.value = true;
      oldRole.value = roleName;
      window.scrollTo({ top: 0, behavior: "smooth" });
      permissions.value.email = role.email;
      permissions.value.unirseReunion = role.unirseReunion;
      permissions.value.asistirReunion = role.asistirReunion;
      permissions.value.editarReunion = role.editarReunion;
      for (const section in permissions.value) {
        if (
          section !== "admin" &&
          typeof permissions.value[section] === "object"
        ) {
          permissions.value.admin = role.admin;
          permissions.value[section].crear = role[section].crear;
          permissions.value[section].leer = role[section].leer;
          permissions.value[section].actualizar = role[section].actualizar;
          permissions.value[section].eliminar = role[section].eliminar;
        }
      }
    };

    const cancel = () => {
      newRole.value = "";
      editingRole.value = false;
      oldRole.value = "";
      permissions.value.email = false;
      permissions.value.unirseReunion = false;
      permissions.value.editarReunion = false;
      permissions.value.admin = false;
      for (const section in permissions.value) {
        if (typeof permissions.value[section] === "object") {
          permissions.value[section].crear = false;
          permissions.value[section].leer = false;
          permissions.value[section].actualizar = false;
          permissions.value[section].eliminar = false;
        }
      }
    };

    const updateRole = async () => {
      const payload = {
        roleName: newRole.value,
        oldRole: oldRole.value,
        newPermissions: permissions.value,
      };
      await store.dispatch("authModule/updateRole", payload);
      newRole.value = "";
      permissions.value = {
        noticias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        incidencias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        sugerencias: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
        admin: false,
        email: false,
        unirseReunion: false,
        editarReunion: false,
      };

      const rol = computed(() => store.getters["authModule/getRol"]);
      roles.value = rol.value;
    };

    onMounted(() => {
      getRoles();
    });

    return {
      newRole,
      permissions,
      sections,
      saveRoles,
      roles,
      deleteRole,
      toggleAdminPermissions,
      editRole,
      selectedRole,
      updateRole,
      editingRole,
      cancel,
      userColors,
      toggleDelegations,
      showDelegations,
    };
  },
};
</script>




<style>
.roles-list {
  margin-top: 20px;
}
.role {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
.role-info {
  flex: 1;
}
.role-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.role-header {
  display: flex;
  align-items: center;
  width: 80%; /* Alinea verticalmente los elementos */
}
.role-header h3 {
  margin-right: auto;
  margin-left: 20%;
}
.role-header q-icon {
  /* El espacio será distribuido automáticamente */
  margin-left: auto;
}
/*
.permission {
  margin-left: 10%;
}*/
</style>
