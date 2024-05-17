import { useStore } from "vuex";

const useSuggestion = () => {
    const store = useStore();

    const createSuggestionDB = async (suggestion) => {
        const resp = await store.dispatch('suggestionModule/createSuggestionDB', suggestion);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const loadSuggestionsDB = async () => {
        const resp = store.dispatch("suggestionModule/loadSuggestions");
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const createSuggestionState = (suggestion) => {
        store.commit('suggestionModule/addSuggestionState', suggestion);
    };

    
    const updateSuggestionState = async (incident) => {
        const resp = store.dispatch("suggestionModule/updateSuggestionDB", incident);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    return {
        createSuggestionDB,
        loadSuggestionsDB,
        createSuggestionState,
        updateSuggestionState
    };
};

export default useSuggestion;