import roma8Api from "src/api/roma8/roma8Api";
import authApi from "../../../../api/roma8/authApi"
import CryptoJS from 'crypto-js';

export const createUser = async ({ commit }, user) => {
  const { email, password, name, surname } = user;
  console.log(email, password, name, surname);

  try {
    const { data } = await authApi.post(':signUp', { email, password, name, returnSecureToken: true });
    const { idToken, refreshToken } = data; //Los datos separados de idToken y del otro

    await authApi.post(':update', { displayName: name, idToken });
    delete user.password;
    commit('loginUser', { user, idToken, refreshToken });
    return { ok: true, message: 'Se ha registrado correctamente' }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.response.data.error.message }
  }
}

export const createUserDemo = async ({ commit }) => {
  const user = {
    email: "altoba@gmail.com",
    password: "123456",
    name: "Alberto",
    surname: "Villegas",
    house: "0-0-0",
    phone: 273268643,
    role: 'admin',
    photo: "https://cdn.icon-icons.com/icons2/510/PNG/512/camera_icon-icons.com_50440.png",
  }
  const md5Password = CryptoJS.MD5(user.password).toString();
  const { data } = await authApi.post(':signUp', {
    email: user.email,
    password: user.password,
    returnSecureToken: true
  });

  let body = {
    email: user.email,
    password: md5Password,
    name: user.name,
    surname: user.surname,
    house: user.house,
    phone: user.phone,
    role: user.role,
    photo: user.photo,
  };

  let admin = {

    admin: true,
    incidencias: {
      actualizar: true,
      crear: true,
      eliminar: true,
      leer: true
    },
    noticias: {
      actualizar: true,
      crear: true,
      eliminar: true,
      leer: true
    },
    sugerencias: {
      actualizar: true,
      crear: true,
      eliminar: true,
      leer: true
    }

  }

  let conf = {
    Actas: {
      activo: true
    },
    Archivos: {
      activo: true
    },
    Espacios: {
      activo: true
    },
    Incidencias: {
      activo: true
    },
    Noticias: {
      activo: true
    },
    Reuniones: {
      activo: true
    },
    Sugerencias: {
      activo: true
    },
    Votaciones: {
      activo: true
    },
    CerrarSesion: {
      activo: true
    },
    Perfil: {
      activo: true
    },
    Configuracion: {
      activo: true
    }
  }
  let house = {
    "0-0-0": {
      adminproperty: false,
      floor: 0,
      n_door: 0,
      stair: 0,
    }
  }
  let color = {
    Diseño: { color: "rgb(46,120,240)" }
  }


  const { dataDB } = await roma8Api.post("/users.json", body);
  await roma8Api.put("/roles/admin.json", admin);
  await roma8Api.put("/configuracion.json", conf);
  await roma8Api.put("/housings.json", house);
  await roma8Api.put("/color.json", color);
  const { idToken, refreshToken } = data;
  const resp = await authApi.post(':update', { displayName: user.name, idToken });
  console.log(resp);
  commit('addUsers', dataDB);
  commit('loginUserAuth', { user, idToken, refreshToken });
  return { ok: true, message: 'Se ha registrado correctamente' }
}

export const signInUser = async ({ commit }, user) => {
  const { email, password } = user;

  try {
    const { data } = await authApi.post(':signInWithPassword', { email, password, returnSecureToken: true });
    const { displayName, idToken, refreshToken } = data;
    user.name = displayName;
    commit('loginUserAuth', { user, idToken, refreshToken });
    return { ok: true, message: 'Se ha iniciado sesión correctamente' };
  } catch (error) {
    return { ok: false, message: error.response.data.error.message };
  }
}

export const checkAuthentication = async ({ commit }) => {
  const idToken = localStorage.getItem('idToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!idToken) {
    commit('logoutUser');
    return { ok: false, message: 'No hay token' }
  }

  try {
    const { data } = await authApi.post(':lookup', { idToken });
    const { displayName, email } = data.users[0];

    const user = {
      name: displayName,
      email
    }
    commit('loginUserAuth', { user, idToken, refreshToken });
    return { ok: true }
  } catch (error) {
    commit('logoutUser');
    return { ok: false, message: error.response.data.error.message }
  }
}

export const updateUserAuth = async ({ commit }, user) => {
  const idToken = localStorage.getItem('idToken');
  console.log(idToken);
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    const { data } = await authApi.post(':update', { idToken, email: user.email });
    localStorage.setItem('idToken', data.idToken);
    localStorage.setItem('refreshToken', refreshToken);
    commit('loginUserAuth', { user, idToken: data.idToken, refreshToken });
    return { ok: true }
  } catch (error) {
    commit('logoutUser');
    return { ok: false, message: error.response.data.error.message }
  }
}

export const updatePasswordAuth = async ({ commit }, payload) => {
  const { user, password } = payload;
  const idToken = localStorage.getItem('idToken');
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    const { data } = await authApi.post(':update', { idToken, password: password });
    console.log("La contraseña es: ", password);
    localStorage.setItem('idToken', data.idToken);
    localStorage.setItem('refreshToken', refreshToken);
    commit('loginUserAuth', { user, idToken: data.idToken, refreshToken });
    return { ok: true }
  } catch (error) {
    commit('logoutUser');
    return { ok: false, message: error.response.data.error.message }
  }
}

export const loadUsersByEmail = async ({ commit }, email) => {
  const { data } = await roma8Api.get("/users.json")
  if (!data) {
    commit('addUsers', []);
    return
  }
  const usersDB = []
  for (let id of Object.keys(data)) {
    usersDB.push({
      id,
      ...data[id]
    })
  }

  commit('addUsers', usersDB);
  return usersDB.find(user => user.email === email);
}


export const loadUsers3 = async ({ commit }) => {
  const { data } = await roma8Api.get("/users.json")
  if (!data) {
    commit('addUsers', []);
    return
  }
  const usersDB = []
  for (let id of Object.keys(data)) {
    usersDB.push({
      id,
      ...data[id]
    })
  }
  console.log("load3 ", usersDB)
  commit('addUsersMee', usersDB);
}

export const loadUsers2 = async ({ commit }) => {
  const { data } = await roma8Api.get("/users.json")
  if (!data) {
    return true
  } else {
    return false
  }

}


export const loadUsersById = async ({ commit }, id) => {
  try {
    const response = await roma8Api.get(`/users/${id}.json`);

    const response2 = await roma8Api.get(`/roles/${response.data.role}.json`);

    const response3 = await roma8Api.get(`/configuracion.json`);

    const response4 = await roma8Api.get(`/housings/${response.data.house}.json`);

    let conf = response3.data
    let rol = response2.data
    let user = response.data;
    let house = response4.data
    user = {
      id,
      ...user
    }
    commit('loginUserDB', { ...user });
    commit('loginRolDB', rol);
    commit('loginHouseDB', house);
    //commit('SET_CONFIGURACION', conf)
    return user;
  } catch (error) {
    console.log('Error al cargar el usuario:', error);
    throw error;
  }
}

export const updateUsersDB = async ({ commit }, user) => {
  const { id, name, surname, email, floor, n_door, phone, role, stair, password } = user
  const dataToSave = { name, surname, email, floor, n_door, phone, role, stair, password }
  const response = await roma8Api.patch(`/users/${id}.json`, dataToSave);

  const updatedUser = { id, name, surname, email, floor, n_door, phone, role, stair, password };
  console.log(response);
  commit('loginUserDB', updatedUser);
}


export const updateUsersDBPhoto = async ({ commit }, payload) => {
  const { user, photo } = payload; //Lo destructuramos para tener tanto user que es del estado y photo por separado
  const { id, name, surname, email, floor, n_door, phone, role, stair, password } = user.value;
  const dataToSave = { name, surname, email, floor, n_door, phone, role, stair, password, photo };
  await roma8Api.patch(`/users/${id}.json`, dataToSave);

  const updatedUser = { id, name, surname, email, floor, n_door, phone, role, stair, password, photo };
  commit("loginUserDB", updatedUser);
};

export const updatePasswordUserDB = async ({ commit }, payload) => {
  const { user, password } = payload;
  const { id, name, surname, email, floor, n_door, phone, role, stair } = user;
  const md5Password = CryptoJS.MD5(password).toString();
  const dataToSave = { name, surname, email, floor, n_door, phone, role, stair, password: md5Password };
  await roma8Api.patch(`/users/${id}.json`, dataToSave);

  const updatedUser = { id, name, surname, email, floor, n_door, phone, role, stair, password: md5Password };
  commit("loginUserDB", updatedUser);
};

export const saveRoles = async ({ commit }, payload) => {

  const { roleName, permissions } = payload; // Extract the role name and permissions from the payload

  try {
    // Here we send a PUT request to the API to create the new role
    await roma8Api.put(`/roles/${roleName}.json`, permissions);
    // If the request is successful, update the Vuex state with the new roles

    commit("mutations", { roleName, permissions });
  } catch (error) {
    console.error('Error creating a new role in the database:', error);
  }
};

export const getRolesFromDatabase = async ({ commit }) => {
  try {
    // Make a GET request to the API to get the roles from Firebase
    const response = await roma8Api.get("/roles.json");
    const roles = response.data; // Assign the roles obtained from the response
    console.log(roles)

    // Call the mutation to store the roles in the Vuex state
    commit("updateRoles", roles);
    return roles;
  } catch (error) {
    console.error('Error getting roles from the database:', error);
  }
};

export const deleteRole = async ({ commit }, roleName) => {
  try {
    console.log(roleName)
    // Make the DELETE request to the API to delete the role based on its name
    await roma8Api.delete(`/roles/${roleName}.json`);

    // Call the mutation to delete the role from the Vuex state
    commit("removeRoleFromState", roleName);
  } catch (error) {
    console.error("Error deleting the role from the database:", error);
    throw error;
  }
};

export const updateRole = async ({ commit }, payload) => {
  const { roleName, newPermissions, oldRole } = payload;

  try {
    // Make the PATCH request to the API to update the role
    await roma8Api.delete(`/roles/${oldRole}.json`);
    await roma8Api.patch(`/roles/${roleName}.json`, newPermissions);
    commit("updateRoleInState", { roleName, newPermissions, oldRole });
  } catch (error) {
    console.error('Error updating the role in the database:', error);
  }
};

export const createUser2 = async ({ commit }, user) => {
  console.log(user.user);
  try {
    await roma8Api.post("/users.json", user.user);
    commit('addUser', user.user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};


export const getUsersFromDatabase = async ({ commit }) => {
  try {
    const response = await roma8Api.get("/users.json");
    const users = response.data;
    console.log(users)
    commit("updateUsers", users);
    return users;
  } catch (error) {
    console.error('Error getting users from the database:', error);
  }
};

export const deleteUserById = async ({ commit }, userId) => {

  try {
    await roma8Api.delete(`/users/${userId}.json`);
    commit('removeUser', userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};



export const saveConfiguration = async ({ commit }, configuration) => {
  try {
    await roma8Api.put('/configuracion.json', configuration);
    console.log('Configuration saved successfully');
  } catch (error) {
    console.error('Error saving the configuration:', error);
  }
};

export const loadConfiguration = async ({ commit }) => {
  try {
    const response = await roma8Api.get(`/configuracion.json`);
    let conf = response.data;
    // commit('SET_CONFIGURATION', conf);
    return conf;
  } catch (error) {
    console.error('Error loading the configuration:', error);
    throw error; // Throw the error so it can be handled by the component
  }
};

export const saveSpace = async ({ commit }, payload) => {

  const { spaceName, space } = payload; // Extract the space name and space data from the payload

  try {
    // Here we send a PUT request to the API to create the new space
    await roma8Api.put(`/espacio/${spaceName}.json`, space);
    // If the request is successful, update the Vuex state with the new space

    commit("NEW_SPACES", { spaceName, space });
  } catch (error) {
    console.error('Error creating a new space in the database:', error);
  }
};

export const getSpacesFromDatabase = async ({ commit }) => {
  try {
    const response = await roma8Api.get("/espacio.json");
    const spaces = response.data;
    commit("SET_SPACES", spaces);
    return spaces;
  } catch (error) {
    console.error("Error getting spaces from the database:", error);
  }
};

export const deleteSpace = async ({ commit }, spaceName) => {
  try {
    await roma8Api.delete(`/espacio/${spaceName}.json`);
    console.log("Space deleted successfully");
    commit("REMOVE_SPACE", spaceName);
  } catch (error) {
    console.error("Error deleting the space:", error);
  }
};

export const updateSpace = async ({ commit }, payload) => {
  try {
    const { spaceName, space, oldSpace } = payload;
    console.log(spaceName)
    console.log(space)
    console.log(oldSpace)
    await roma8Api.delete(`/espacio/${oldSpace}.json`);
    await roma8Api.put(`/espacio/${spaceName}.json`, space);
    console.log("Space updated successfully");
    // Call the mutation to update the Vuex state
    //commit("UPDATE_SPACE", payload);
  } catch (error) {
    console.error("Error updating the space:", error);
  }
};

export const saveColorToDatabase = async ({ commit }, { name, color }) => {
  try {

    // Llama a tu API para guardar el color en la base de datos
    await roma8Api.put(`/color/${name}.json`, { color });
    console.log('Color guardado en la base de datos:', color);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error;
  }
};

export const getColorsFromDatabase = async ({ commit }) => {
  try {
    // Realiza una solicitud para obtener los colores de la base de datos
    const response = await roma8Api.get('/color.json');
    const colors = response.data;
    // Commit de la mutación para actualizar el estado con los colores obtenidos
    commit('SET_COLORS', colors);
    return colors;
  } catch (error) {
    console.error('Error al obtener los colores de la base de datos:', error);
    throw error;
  }
};

export const saveMeetinglive = async ({ commit }, meeting) => {
  try {
    console.log(meeting.date)
    await roma8Api.patch(`/meetinglive/${meeting.date}.json`, meeting);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error;
  }
};


export const loadMeetinglive = async ({ commit }, fecha) => {
  try {
    const data = await roma8Api.get(`/meetinglive/${fecha}.json`);
    return data.data
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error; // Asegura que el error se propague para que puedas manejarlo adecuadamente en el componente Vue
  }
};


export const saveActa = async ({ commit }, pdfDownloadURL) => {
  try {
    console.log(pdfDownloadURL)

    const body = {
      url: pdfDownloadURL,
    }
    // Llama a tu API para guardar el color en la base de datos
    await roma8Api.post("/actas/listActas.json", body);
    //console.log('Color guardado en la base de datos:', color);
  } catch (error) {
    console.error('Error al guardar el pdf en la base de datos:', error);
    throw error;
  }
};

export const saveHeaderActs = async ({ commit }, payload) => {
  try {
    await roma8Api.put("/actas/structure.json", payload);
  } catch (error) {
    console.error('Error al guardar el pdf en la base de datos:', error);
    throw error;
  }
};

export const loadHeaderActs = async ({ commit }) => {
  try {
    const response = await roma8Api.get("/actas/structure.json");
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    throw error;
  }
};

export const savesignature = async ({ commit }, body) => {
  try {
    const rule = {
      url: body.signature
    }
    // Llama a tu API para guardar el color en la base de datos
    console.log(`/meetinglive/${body.date}/participants/${body.id}.json`, body.signature)
    await roma8Api.patch(`/meetinglive/${body.date}/participants/${body.id}.json`, rule);
    //console.log('Color guardado en la base de datos:', color);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error; // Asegura que el error se propague para que puedas manejarlo adecuadamente en el componente Vue
  }
};

export const createHousing = async ({ commit }, housing) => {
  try {
    const customKey = `${housing.stair}-${housing.floor}-${housing.n_door}`;
    // Realiza la solicitud a la API para agregar la vivienda
    await roma8Api.put(`/housings/${customKey}.json`, housing);

    // Si la operación es exitosa, llama a la mutación para actualizar el estado
    commit('addHousing', housing);
  } catch (error) {
    console.error('Error creating housing:', error);
    throw error; // Puedes manejar el error de acuerdo con la lógica de tu aplicación
  }
};

export const getHousingsFromDatabase = async ({ commit }) => {
  try {
    // Realiza la solicitud GET a la API para obtener las viviendas de la base de datos
    const response = await roma8Api.get("/housings.json");

    const housings = response.data; // Asigna las viviendas obtenidas de la respuesta
    console.log(housings);

    // Llama a la mutación para almacenar las viviendas en el estado Vuex
    commit("updateHousings", housings);
    return housings;
  } catch (error) {
    console.error('Error getting housings from the database:', error);
  }
};

export const deleteHousing = async ({ commit }, housingId) => {
  try {
    // Realiza la solicitud a la API para eliminar la vivienda
    await roma8Api.delete(`/housings/${housingId}.json`);

    // Si la operación es exitosa, llama al mutation para actualizar el estado
    commit('removeHousing', housingId);
  } catch (error) {
    console.error('Error deleting housing:', error);
    throw error; // Puedes manejar el error de acuerdo con la lógica de tu aplicación
  }
};

export const loadRols = async ({ commit }) => {
  try {
    const { data } = await roma8Api.get('/roles.json');
    if (!data) {
      commit('addUsers', []);
      return
    }
    console.log("La data es: ", data)
    return data;
  } catch (error) {
    console.error('Error al obtener datos:', error);
    throw error;
  }
};

export const getMeeting = async ({ commit }, id) => {
  try {
    // Realiza la solicitud GET a la API para obtener las viviendas de la base de datos
    const response = await roma8Api.get(`/meetings/${id}.json`);

    const meet = response.data;

    return meet;
  } catch (error) {
    console.error('Error getting housings from the database:', error);
  }
};

export const deleteDelegation = async ({ commit }, payload) => {
  try {
    // Realiza la solicitud a la API para eliminar la vivienda
    console.log(payload.meeid)
    console.log(payload.id)
    console.log(payload.iddelego)
    let body = {
      active: false
    }

    await roma8Api.patch(`/meetings/${payload.meeid}/assistants/${payload.iddelego}/delegations/${payload.id}.json`, body);
    await roma8Api.delete(`/meetings/${payload.meeid}/assistants/${payload.id}/delego.json`);
  } catch (error) {
    console.error('Error deleting housing:', error);
    throw error; // Puedes manejar el error de acuerdo con la lógica de tu aplicación
  }
};