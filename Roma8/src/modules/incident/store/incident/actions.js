import roma8Api from "src/api/roma8/roma8Api";

export const createIncidentDB = async ({ commit }, incident) => {
    console.log("El incidente es: ", incident)
    const { data } = await roma8Api.post("/incidents.json", incident);
    console.log(data);
    commit('addIncidentList', incident);
    return { ok: true, message: 'La incidencia se ha creado correctamente' }
}

export const loadIncidents = async ({ commit }) => {
    const { data } = await roma8Api.get("/incidents.json")
    if (!data) {
        commit('addIncidents', []);
        return
    }
    const incidentsDB = []
    for (let id of Object.keys(data)) {
        incidentsDB.push({
            id,
            ...data[id]
        })
    }
    commit('addIncidents', incidentsDB);
    return incidentsDB;
}

export const updateIncidentDB = async ({ commit }, incident) => {
    const { id, title, description, date, name, photo, state } = incident;
    console.log("El estado es: ", state)
    const dataToSave = { state }
    const response = await roma8Api.patch(`/incidents/${id}.json`, dataToSave);
    console.log(response);

    const updatedIncident = { id, title, description, date, name, photo, state };
    console.log(response);
    commit('updateIncidentState', updatedIncident);
}
