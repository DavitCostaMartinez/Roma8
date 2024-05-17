import axios from 'axios';

const roma8Api = axios.create({
    baseURL: process.env.VUE_APP_API_URL

})

roma8Api.interceptors.request.use((config) => {

    config.params = {
        auth: localStorage.getItem('idToken')
    }
    return config
})

export default roma8Api