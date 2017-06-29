/**
 * @file detail router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Detail from '@/pages/detail/Detail.vue';

export default {
    base: '/detail',
    routes: [
        {
            path: '/:id',
            name: 'detail',
            component: Detail,
            meta: {
                notKeepAlive: true
            }
        }
    ]
};
