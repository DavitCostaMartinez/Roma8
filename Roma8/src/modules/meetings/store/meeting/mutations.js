export const addMeetings = (state, meetings) => {
    state.meetings = meetings
    console.log("Las reuniones son: ", state.meetings);
}

export const addMeetingState = (state, meeting) => {
    state.meeting = meeting;
    console.log("El estado de la reunion: ", state.meeting);
}

export const addMeetingList = (state, meeting) => {
    state.meetings = [...state.meetings, meeting];
    console.log("El estado de la reunion es: ", state.meeting);
}