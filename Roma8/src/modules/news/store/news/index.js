import state from './state'
import * as mutations from './mutations'
import * as actions from './actions'
import * as getters from './getters'

const newsModule = {
    namespaced: true, //estaran capsulados del exterior
    state,
    mutations,
    actions,
    getters //Obtener informacion procesada del state
}

export default newsModule

//El store se usara de cara al modulo que voy a usar manejar o relacionar con el componente como con el directorio DayBook
//La idea de trabajar con modulos es que cuando quieras algo de eso especifico pues los tendras aqui y es mucho mas organizado y sabrás donde esta cada cosa