
export const currentState = (state) => {
    return state.status
}

export const username = (state) => {
    return state.userDB?.name || ''
}

export const getUsers = (state) => {
    return state.users
}

export const getUsersmee = (state) => {
    return state.usersmee
}

export const getUserDB = (state) => {
    return state.userDB
}

export const getRol = (state) => {
    return state.roles
};

export const getRolDB = (state) => {
    return state.rolDB
};

export const getConf = (state) => {
    return state.configuracion;
  };


  export const getUserColors = (state) => {
    return state.colors;
  };

  export const getUsuarios = (state) => {
    return state.usuarios
}

export const getHouseDB = (state) => {
    return state.HouseDB
};
