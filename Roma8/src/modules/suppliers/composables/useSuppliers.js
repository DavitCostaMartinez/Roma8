import { useStore } from "vuex";

const useSuppliers = () => {
    const store = useStore();

    const createSuppliersDB = async (prov) => {
        const resp = await store.dispatch('suppliersModule/createSuppliersDB', prov);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const loadSuppliersDB = async () => {
        const resp = store.dispatch("suppliersModule/loadSuppliersDB");
        console.log("La respuesta es: ", resp);
        return resp;
    };

    const updateSupplierDB = async (prov) => {
        const resp = store.dispatch("suppliersModule/updateSupplier", prov);
        console.log("La respuesta es: ", resp);
        return resp;
    };
    
    const deleteSupplierDB = async (id) => {
        const resp = store.dispatch("suppliersModule/deleteSupplier", id);
        console.log("La respuesta es: ", resp);
        return resp;
    };

    return {
        createSuppliersDB,
        loadSuppliersDB,
        deleteSupplierDB,
        updateSupplierDB
    };
};

export default useSuppliers;