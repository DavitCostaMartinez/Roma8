import authRouter from '../modules/auth/router/index';

const routes = [
  {
    path: '/',
    ...authRouter
  },
  {
    path: '/mainLayout/:id',
    name: 'main-layout',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'meetings-page', name: 'meetings-page', component: () => import('src/pages/MeetingsListPage.vue') },
      { path: 'new-meeting', name: 'new-meeting', component: () => import('src/pages/NewMeeting.vue') },
      {
        path: 'IncidentList', name: 'incidents-list', component: () => import('src/pages/IncidentList.vue'),
      },
      { path: 'newIncident', name: 'new-incident', component: () => import('src/pages/NewIncident.vue') },
      { path: 'proceedingsPage', name: 'proceedings-page', component: () => import('src/pages/ProceedingsPage.vue') },
      {
        path: 'suggestionsList', name: 'suggestions-list', component: () => import('src/pages/SuggestionsList.vue')
      },
      { path: 'newSuggestion', name: 'new-suggestion', component: () => import('src/pages/NewSuggestion.vue') },
      { path: 'votationsPage', name: 'votations-page', component: () => import('src/pages/VotationsPage.vue') },
      { path: 'filesPage', name: 'files-page', component: () => import('src/pages/FilesPage.vue') },
      {
        path: 'newsList', name: 'news-list', component: () => import('src/pages/NewsList.vue'),
      },
      { path: 'newPage', name: 'news-page', component: () => import('src/pages/NewsPage.vue') },
      {
        path: 'profilePage', name: 'profile-page', component: () => import('src/pages/ProfilePage.vue'),
        props: (route) => {
          return {
            id: route.params.id
          }
        },
      },
      {
        path: 'adminPage', name: 'admin-page', component: () => import('src/pages/AdminPage.vue'),
        props: (route) => {
          return {
            id: route.params.id
          }
        },
      },
      { path: 'AdminVivienda', name: 'admin-vivienda', component: () => import('src/pages/AdminUser.vue') },
      {
        path: 'AdminActas/:fecha', name: 'admin-actas', component: () => import('src/pages/AdminVivienda.vue'),
        props: (route) => {
          return {
            fecha: route.params.fecha
          }
        },
      },
      {
        path: 'LiveMeeting/:fecha', name: 'live-meeting', component: () => import('src/pages/LiveMeeting.vue'),
        props: (route) => {
          return {
            fecha: route.params.fecha
          }
        },
      },
      { path: 'AdminRol', name: 'admin-rol', component: () => import('src/pages/AdminRol.vue') },
      { path: 'AdminConf', name: 'admin-conf', component: () => import('src/pages/AdminConf.vue') },
      { path: 'AdminEspacio', name: 'admin-espacio', component: () => import('src/pages/AdminEspacio.vue') },
      { path: 'AdminTema', name: 'admin-tema', component: () => import('src/pages/AdminTema.vue') },
      { path: 'Admin-Proveedor', name: 'supply-page', component: () => import('src/pages/AdminProveedor.vue') },
      { path: 'suppliers-page', name: 'suppliers-page', component: () => import('src/pages/SuppliersListPage.vue') },
      { path: 'header-acts', name: 'header-acts', component: () => import('src/pages/HeadersActs.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;