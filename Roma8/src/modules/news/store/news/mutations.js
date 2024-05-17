export const addNews = (state, news) => {
    state.news = news;
    console.log("Las noticias son: ", state.news);
}

export const addNewscastInList = (state, newscast) => {
    state.news = [ ...state.news, newscast ];
    console.log("El estado de la noticia es: ", state.newscast);
}

export const addNewscastState = (state, newscast) => {
    state.newscast = newscast;
    console.log("El estado de la noticia es: ", state.newscast);
}

export const removeNewscast = (state, newId) => {
    if (state.news[newId]) {
        delete state.news[newId];
    }
};

export const setNews = (state, news) => {
    state.news = news
    console.log("Las noticias son: ", state.news);
}

