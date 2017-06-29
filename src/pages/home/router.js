/**
 * @file home router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Home from '@/pages/home/Home.vue';
import User from '@/pages/home/User.vue';

export default {
    base: '/home',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/user',
            name: 'user',
            component: User
        }
    ]
};
