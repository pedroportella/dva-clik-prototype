import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/features/service-records/pages/HomePage.vue';
import RecordListPage from '@/features/service-records/pages/RecordListPage.vue';
import RecordCreatePage from '@/features/service-records/pages/RecordCreatePage.vue';
import RecordViewPage from '@/features/service-records/pages/RecordViewPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/records', name: 'records', component: RecordListPage },
    { path: '/records/new', name: 'record-create', component: RecordCreatePage },
    { path: '/records/:id', name: 'record-view', component: RecordViewPage, props: true },
  ],
});
