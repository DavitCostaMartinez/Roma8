import roma8Api from "src/api/roma8/roma8Api";

export const createMeetingDB = async ({ commit }, meeting) => {
  console.log("La reunión es: ", meeting)
  const { data } = await roma8Api.post("/meetings.json", meeting);
  console.log(data);
  commit('addMeetingList', meeting);
  return { ok: true, message: 'Reunion creada correctamente' }
}

export const createVotationDB = async ({ commit }, meeting) => {
  try {
    meeting.active = true;
    //console.log('Color guardado en la base de datos:', color);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error; // Asegura que el error se propague para que puedas manejarlo adecuadamente en el componente Vue
  }
};

export const loadMeetings = async ({ commit }) => {
  const { data } = await roma8Api.get("/meetings.json")
  if (!data) {
    commit('addMeetings', []);
    return
  }
  const meetingsDB = []
  for (let id of Object.keys(data)) {
    meetingsDB.push({
      id,
      ...data[id]
    })
  }
  commit('addMeetings', meetingsDB);
  return meetingsDB;
}

export const saveMeetingVotes = async ({ commit }, votesOption) => {
  try {
    const body = {
      text: votesOption.text,
      numVotes: votesOption.numVotes
    }
    await roma8Api.patch(`/meetinglive/${votesOption.date}/votation/${votesOption.order}/options/${votesOption.index}.json`, body);
    //commit('addOrderVote', votesOption);
  } catch (error) {
    throw error;
  }
};

export const saveIsVoted = async ({ commit }, bodyIsVoted) => {
  try {
    const body = {
      isVoted: true,
    }
    console.log("Mi cuerpo es: ", bodyIsVoted.id)
    await roma8Api.patch(`/meetinglive/${bodyIsVoted.date}/participants/${bodyIsVoted.id}.json`, body);
    if (bodyIsVoted.delegationId) {
      await roma8Api.patch(`/meetinglive/${bodyIsVoted.date}/participants/${bodyIsVoted.id}/delegations/${bodyIsVoted.delegationId}.json`, body);
    }
  } catch (error) {
    throw error;
  }
};

export const saveAssistants = async ({ commit }, information) => {
  try {
    const { meetingId, participants } = information;
    await roma8Api.patch(`/meetings/${meetingId}/assistants.json`, participants);
  } catch (error) {
    throw error;
  }
};

export const updateAssistants = async ({ commit }, info) => {
  try {
    const { meetingId, indexDelegation, indexAssistant } = info;

    const body = {
      active: true
    }
    const del = {
      delego: indexDelegation
    }
    console.log("El indice es: ", indexDelegation);
    await roma8Api.patch(`/meetings/${meetingId}/assistants/${indexDelegation}/delegations/${indexAssistant}.json`, body);
    await roma8Api.patch(`/meetings/${meetingId}/assistants/${indexAssistant}.json`, del);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error;
  }
};

export const getInfoMeeting = async ({ commit }, info) => {
  try {
    const { meetingId, indexDelegation, indexAssistant } = info;

    const body = {
      active: true
    }
    console.log("El indice es: ", indexDelegation);
    await roma8Api.patch(`/meetings/${meetingId}/assistants/${indexAssistant}/delegations/${indexDelegation}.json`, body);
  } catch (error) {
    console.error('Error al guardar el color en la base de datos:', error);
    throw error;
  }
};