import { useStore } from "vuex";

const useMeeting = () => {
    const store = useStore();

    const createMeetingDB = async (meeting) => {
        const resp = await store.dispatch('meetingModule/createMeetingDB', meeting);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const createVotationDB = async (votation) => {
        const resp = await store.dispatch('meetingModule/createVotationDB', votation);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const loadMeetingsDB = async () => {
        const resp = store.dispatch("meetingModule/loadMeetings");
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const createMeetingState = (meeting) => {
        store.commit('meetingModule/addMeetingState', meeting);
    };

    const updateMeetingStateDB = async (meeting) => {
        const resp = store.dispatch("meetingModule/updateMeetingDB", meeting);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const saveMeetingVotes = async (optionNumVotes) => {
        const resp = store.dispatch("meetingModule/saveMeetingVotes", optionNumVotes);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const saveIsVoted = async (bodyIsVoted) => {
        const resp = store.dispatch("meetingModule/saveIsVoted", bodyIsVoted);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const saveAssistants = async (meetingId, participants) => {
        const payload = { meetingId, participants };
        const resp = store.dispatch("meetingModule/saveAssistants", payload);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const updateAssistants = async (meetingId, indexDelegation, indexAssistant) => {
        const payload = { meetingId, indexDelegation, indexAssistant };
        const resp = store.dispatch("meetingModule/updateAssistants", payload);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    return {
        createMeetingDB,
        loadMeetingsDB,
        createMeetingState,
        updateMeetingStateDB,
        createVotationDB,
        saveMeetingVotes,
        saveIsVoted,
        saveAssistants,
        updateAssistants
    };
};

export default useMeeting;