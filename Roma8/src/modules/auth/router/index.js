
export default {
    name: 'auth',
    component: () => import(/* webpackChunkName: "index de router" */ '../layouts/AuthLayout.vue'),
    children: [
        {
            path: '/',
            name: 'login-screen',
            component: () => import(/* webpackChunkName: "login" */ '../views/loginScreen.vue')
        }
    ]
}