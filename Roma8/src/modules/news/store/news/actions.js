import roma8Api from "src/api/roma8/roma8Api";

export const createNewsDB = async ({ commit }, newscast) => {
    console.log("La noticia es: ", newscast)
    const { data } = await roma8Api.post("/news.json", newscast);
    console.log(data);
    commit('addNews', newscast);
    return { ok: true, message: 'Noticia creada correctamente' }
}

export const loadNews = async ({ commit }) => {
    const { data } = await roma8Api.get("/news.json")
    if (!data) {
        commit('addNews', []);
        return
    }
    const newsDB = []
    for (let id of Object.keys(data)) {
        newsDB.push({
            id,
            ...data[id]
        })
    }
    commit('addNews', newsDB);
    return newsDB;
}

export const deleteNewsById = async ({ commit }, newId) => {
    try {
        console.log("Mi id es: ", newId)
        await roma8Api.delete(`/news/${newId}.json`);
        commit('removeNewscast', newId);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};