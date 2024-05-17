import { useStore } from "vuex";

const isAuthenticatedGuard = async (to, from, next) => {
    const store = useStore();

    const { ok } = await store.dispatch('authModule/checkAuthentication');
    console.log("El ok es: ", ok);
    if (ok) next();
    else next({ name: 'login-screen' })
}

export default isAuthenticatedGuard