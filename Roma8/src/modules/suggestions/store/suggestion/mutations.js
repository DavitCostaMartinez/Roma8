export const addSuggestions = (state, suggestion) => {
    state.suggestions = suggestion
    console.log("Las sugerencias son: ", state.suggestions);
}

export const addSuggestionState = (state, suggestion) => {
    state.suggestion = suggestion;
    console.log("El estado de la sugerencia es: ", state.suggestion);
}

export const updateIncidentState = (state, suggestion) => {
    const idx = state.suggestions.map(sg => sg.id).indexOf(sg.id)
    console.log({ idx });
    state.suggestions[idx] = suggestion
}

export const newSuggestion = (state, suggestion) => {
    state.suggestions = [...state.suggestions, suggestion];
    console.log("El estado de la sugerencia 2 es: ", state.suggestion);
}