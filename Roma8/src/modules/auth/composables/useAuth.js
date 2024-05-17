import { useStore } from "vuex";
import { computed } from "vue";

const useAuth = () => {
    const store = useStore();

    const createUser = async (user) => {
        const resp = await store.dispatch('authModule/createUser', user);
        return resp;
    };

    const createUserDemo = async () => {
        const resp = await store.dispatch('authModule/createUserDemo');
        return resp;
    };

    const loginUser = async (user) => {
        const resp = await store.dispatch('authModule/signInUser', user);
        return resp;
    }

    const loadUsers = async (email) => {
        const resp = await store.dispatch('authModule/loadUsers', email);
        return resp;
    }

    const loadUsersById = async (id) => {
        console.log("El id es: ", id)
        const resp = await store.dispatch('authModule/loadUsersById', id);
        return resp;
    }

    const updateUserDB = async (user) => {
        const resp = await store.dispatch('authModule/updateUsersDB', user);
        return resp;
    };

    const updateUserDBPhoto = async (user, photo) => {
        const payload = { user, photo };
        const response = await store.dispatch('authModule/updateUsersDBPhoto', payload);
        return response;
    };

    const updatePasswordDB = async (user, password) => {
        const payload = { user, password }
        const response = await store.dispatch('authModule/updatePasswordUserDB', payload);
        return response;
    };

    const updateUserAuthentication = async (user) => {
        const resp = await store.dispatch('authModule/updateUserAuth', user);
        return resp;
    }

    const updatePasswordAuthentication = async (user, password) => {
        const payload = { user, password }
        const resp = await store.dispatch('authModule/updatePasswordAuth', payload);
        return resp;
    }

    const checkAuthentication = async () => {
        const resp = await store.dispatch('authModule/checkAuthentication');
        return resp;
    };

    const logout = () => {
        store.commit('authModule/logoutUser');
    };

    const loadRols = async () => {
        const resp = await store.dispatch('authModule/loadRols');
        return resp;
    }

    const deleteUserById = async (id) => {
        const resp = await store.dispatch('authModule/deleteUserById', id);
        return resp;
    }

    const saveHeaderActs = async (headerAct1, headerAct2, headerAct3, openingSession, finishSession) => {
        const payload = { headerAct1, headerAct2, headerAct3, openingSession, finishSession }
        const resp = await store.dispatch('authModule/saveHeaderActs', payload);
        return resp;
    }

    const loadHeaderActs = async () => {
        const resp = await store.dispatch('authModule/loadHeaderActs');
        return resp;
    }

    return {
        createUser,
        createUserDemo,
        loadUsers,
        loadUsersById,
        loginUser,
        updateUserAuthentication,
        checkAuthentication,
        logout,
        updateUserDB,
        updateUserDBPhoto,
        updatePasswordDB,
        updatePasswordAuthentication,
        loadRols,
        deleteUserById,
        saveHeaderActs,
        loadHeaderActs,
        authStatus: computed(() => store.getters['authModule/currentState']),
        username: computed(() => store.getters['authModule/username']),
        user: computed(() => store.getters["authModule/getUser"]),
        users: computed(() => store.getters["authModule/getUsers"]),
    };
};

export default useAuth;