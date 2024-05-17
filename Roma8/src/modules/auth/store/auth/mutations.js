export const loginUserAuth = (state, { user, idToken, refreshToken }) => { //Estas mutaciones tienen que ser sincronas
  if (idToken) {
    localStorage.setItem('idToken', idToken);
    state.idToken = idToken;
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    state.refreshToken = refreshToken;
  }
  state.userAuthentication = user;
  state.status = 'authenticated'
}

export const loginUserDB = (state, user) => { //Estas mutaciones tienen que ser sincronas
  state.userDB = user;
  console.log("El estado del usuario: ", state.userDB);
  state.status = 'authenticated'
}

export const loginRolDB = (state, user) => { //Estas mutaciones tienen que ser sincronas
  state.rolDB = user;
}
export const logoutUser = (state) => { //Estas mutaciones tienen que ser sincronas
  state.userAuthentication = null;
  state.status = 'not-authenticated';
  state.idToken = null;
  state.refreshToken = null;
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken')
}

export const addUsers = (state, user) => { //Estas mutaciones tienen que ser sincronas
  state.users = [user, ...state.users]
}

export const updateUserDB = (state, user) => { //Estas mutaciones tienen que ser sincronas
  const idx = state.users.map(u => u.id).indexOf(user.id)
  console.log({ idx });
  state.users[idx] = user
}

export const mutations = (state, { roleName, permissions }) => {
  // Merge the new permissions with the existing permissions in the state
  state.roles = {
    ...state.roles,
    [roleName]: permissions
  };
};

export const updateRoles = (state, roles) => {
  state.roles = roles; // Update Vuex state with the roles obtained from the database
};

/*
THERE IS AN ERROR BECAUSE IT DOES NOT FIND IT AS AN ARRAY BUT IT CONTINUES TO WORK LIKE THIS, SO, I DON'T KNOW
*/
export const removeRoleFromState = (state, roleName) => {
  // Check if state.roles is an array before calling findIndex
  delete state.roles[roleName];
};

export const updateRoleInState = (state, { roleName, newPermissions, oldRole  }) => {
  // Update only the permissions of the specific role
  delete state.roles[oldRole];
  state.roles[roleName] = {
    ...state.roles[roleName],
    ...newPermissions
  };
};


export const updateUsers = (state, users) => {
  state.usuarios = users;
};

export const removeUser = (state, userId) => {
  // Find the index of the user to be deleted in the state
  console.log(userId)
  console.log(state.users)

  if (state.usuarios[userId]) {
    // Delete the user from the state using userId as the key
    delete state.usuarios[userId];
  }
};

export const addUser = (state, user) => {
  // Add the new user to the array of users in the state
  console.log(user)
  state.usuarios = { ...state.usuarios, user };
  console.log(state.usuarios)
};

export const SET_CONFIGURATION = (state, configuration) => {
  state.configuration = configuration;
};

export const NEW_SPACES = (state, { spaceName, space }) => {
  // Si state.spaces es null, inicialízalo como un objeto vacío
  if (!state.spaces) {
    state.spaces = {};
  }
  // Ahora puedes agregar la nueva propiedad al objeto state.spaces
  state.spaces[spaceName] = space;
};

export const SET_SPACES = (state, spaces) => {
  state.spaces = spaces;
};

export const ADD_SPACE = (state, { spaceName, space }) => {
  state.spaces[spaceName] = space;
};

export const REMOVE_SPACE = (state, spaceName) => {
  delete state.spaces[spaceName];
};

export const UPDATE_SPACE = (state, { spaceName, newDetails }) => {
  state.spaces[spaceName] = newDetails;
};

export const SET_COLORS = (state, colors) => {
  state.colors = colors;
};

export const addUsersMee = (state, user) => { //Estas mutaciones tienen que ser sincronas
  state.usersmee = user
}

export const updateHousings = (state, housings) => {
  // Actualiza el estado Vuex con las viviendas obtenidas de la base de datos
  state.housings = housings;
};

export const addHousing = (state, housing) => {
  state.housings={ ...state.housing, housing };
};

export const removeHousing = (state, housingId) => {
  if (state.housings[housingId]) {
    // Delete the user from the state using userId as the key
    delete state.housings[housingId];
  }
};

export const loginHouseDB = (state, user) => { //Estas mutaciones tienen que ser sincronas
  state.HouseDB = user;
}