import { useStore } from "vuex";

const useIncident = () => {
    const store = useStore();

    const createIncidentDB = async (incident) => {
        const resp = await store.dispatch('incidentModule/createIncidentDB', incident);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const loadIncidentsDB = async () => {
        const resp = store.dispatch("incidentModule/loadIncidents");
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const createIncidentState = (incident) => {
        store.commit('incidentModule/addIncidentState', incident);
    };

    const updateIncidentStateDB = async (incident) => {
        const resp = store.dispatch("incidentModule/updateIncidentDB", incident);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    return {
        createIncidentDB,
        loadIncidentsDB,
        createIncidentState,
        updateIncidentStateDB
    };
};

export default useIncident;