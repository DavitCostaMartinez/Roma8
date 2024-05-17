export const addSuppliers = (state, suppliers) => {
    state.suppliers = suppliers;
    console.log("Los proveedores son: ", state.suppliers);
}

export const addNewscastInList = (state, newscast) => {
    state.news = [...state.news, newscast];
    console.log("El estado de la noticia es: ", state.newscast);
}

export const addNewscastState = (state, newscast) => {
    state.newscast = newscast;
    console.log("El estado de la noticia es: ", state.newscast);
}

export const deleteSupply = (state, newId) => {
    delete state.suppliers[newId];
};

export const updateSupplier = (state, prov) => {
    const { oldIdSupplier } = prov;
    const idx = state.suppliers.map(sup => sup.id).indexOf(oldIdSupplier)
    console.log({ idx });
    state.suppliers[idx] = prov;
    console.log("Lista de proveedores actualizada: ", state.suppliers);
}



