import { useStore } from "vuex";

const useNews = () => {
    const store = useStore();

    const createNewsDB = async (news) => {
        const resp = await store.dispatch('newsModule/createNewsDB', news);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const loadNewsDB = async () => {
        const resp = store.dispatch("newsModule/loadNews");
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const createNewsState = (news) => {
        store.commit('newsModule/addNewscastState', news);
    };

    
    const deleteNewscastDBAndState = async (id) => {
        const resp = store.dispatch("newsModule/deleteNewsById", id);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    return {
        createNewsDB,
        loadNewsDB,
        createNewsState,
        deleteNewscastDBAndState
    };
};

export default useNews;