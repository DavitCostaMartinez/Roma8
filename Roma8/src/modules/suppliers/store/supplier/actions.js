import roma8Api from "src/api/roma8/roma8Api";

export const createSuppliersDB = async ({ commit }, prov) => {
    console.log("El proveedor es: ", prov)
    const { data } = await roma8Api.post("/proveedores.json", prov);
    console.log(data);
    commit('addSuppliers', prov);
    return { ok: true, message: 'Proveedor creada correctamente' }
}

export const loadSuppliersDB = async ({ commit }) => {
    const { data } = await roma8Api.get("/proveedores.json")
    if (!data) {
        commit('addSuppliers', []);
        return
    }
    const suppliersDB = []
    for (let id of Object.keys(data)) {
        suppliersDB.push({
            id,
            ...data[id]
        })
    }

    commit('addSuppliers', suppliersDB);
    return suppliersDB;
}

export const deleteSupplier = async ({ commit }, id) => {
    try {
        console.log("El id es: ", id)
        await roma8Api.delete(`/proveedores/${id}.json`);
        console.log("Proveedor eliminado correctamente");
    } catch (error) {
        console.error("Error deleting the space:", error);
    }
};

export const updateSupplier = async ({ commit }, payload) => {
    try {
        const { supplier, oldIdSupplier } = payload;
        console.log("El id es: ", oldIdSupplier)
        console.log("La foto nueva es: ", supplier.photo)
        await roma8Api.patch(`/proveedores/${oldIdSupplier}.json`, supplier);
        commit("updateSupplier", payload);
        console.log("Proveedor actualizado correctamente");
    } catch (error) {
        console.error("Error updating the space:", error);
    }
};