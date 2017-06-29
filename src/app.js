/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import Vuetify from 'vuetify';
import VueTouch from 'vue-touch';
import App from './App.vue';
import {createRouter} from './router.js';
import store from './store';
import Icon from 'vue-awesome/components/Icon.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import FastClick from 'fastclick';

import '@/assets/styles/global.styl';

// global progress bar
const loading = Vue.prototype.$loading = new Vue(ProgressBar).$mount();
document.body.appendChild(loading.$el);

FastClick.attach(document.body);

Vue.use(Vuetify);

Vue.component('icon', Icon);

// 基于hammer.js的手势库
Vue.use(VueTouch);

Vue.config.productionTip = false;

// a global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        const asyncData = this.$options.asyncData;
        if (asyncData) {
            loading.start();
            asyncData.call(this, {
                store: this.$store,
                route: to
            }).then(() => {
                loading.finish();
                next();
            }).catch(next);
        }
        else {
            next();
        }
    }
});

/* eslint-disable no-new */

export function createApp(routerParams) {
    const router = createRouter(routerParams);

    // after async components have been resolved
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to);
        const prevMatched = router.getMatchedComponents(from);

        let diffed = false;
        const activated = matched.filter((c, i) => {
            const ret = diffed || (diffed = (prevMatched[i] !== c));
            return ret;
        });

        if (!activated.length) {
            return next();
        }

        loading.start();
        Promise.all(activated.map(c => {
            if (c.asyncData && (!c.asyncDataFetched || to.meta.notKeepAlive)) {
                return c.asyncData.call(c, {
                    store,
                    route: to
                }).then(() => {
                    c.asyncDataFetched = true;
                });
            }
        })).then(() => {
            loading.finish();
            next();
        }).catch(next);
    });

    const app = new Vue({
        router,
        store,
        ...App
    });
    return {app, router, store};
}
