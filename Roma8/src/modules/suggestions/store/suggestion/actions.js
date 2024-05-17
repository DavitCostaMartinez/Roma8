import roma8Api from "src/api/roma8/roma8Api";

export const createSuggestionDB = async ({ commit }, suggestion) => {
    console.log("La sugerencia es: ", suggestion);
    const { data } = await roma8Api.post("/suggestions.json", suggestion);
    console.log(data);
    commit('newSuggestion', suggestion);
    return { ok: true, message: 'La sugerencia se ha creado correctamente' }
}

export const loadSuggestions = async ({ commit }) => {
    const { data } = await roma8Api.get("/suggestions.json")
    if (!data) {
        commit('addSuggestions', []);
        return
    }
    const suggestionsDB = []
    for (let id of Object.keys(data)) {
        suggestionsDB.push({
            id,
            ...data[id]
        })
    }
    commit('addSuggestions', suggestionsDB);
    return suggestionsDB;
}

export const updateSuggestionDB = async ({ commit }, suggestion) => {
    const { id, title, description, date, name, photo } = suggestion;
    console.log("El estado es: ", state)
    const dataToSave = { state }
    const response = await roma8Api.patch(`/incidents/${id}.json`, dataToSave);
    console.log(response);

    const updatedIncident = { id, title, description, date, name, photo, state };
    console.log(response);
    commit('updateIncidentState', updatedIncident);
}
