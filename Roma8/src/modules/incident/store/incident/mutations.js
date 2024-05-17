export const addIncidents = (state, incident) => {
    state.incidents = incident
    console.log("Las incidencias son: ", state.incidents);
}

export const addIncidentState = (state, incident) => {
    state.incident = incident;
    console.log("El estado del incidente: ", state.incident);
}

export const updateIncidentState = (state, incident) => {
    const idx = state.incidents.map(inc => inc.id).indexOf(incident.id)
    console.log({ idx });
    state.incidents[idx] = incident
}

export const addIncidentList = (state, incident) => {
    state.incidents = [ ...state.incidents, incident ];
    console.log("El estado de la incidencia es: ", state.incident);
}