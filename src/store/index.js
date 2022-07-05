import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        serverProblem: 0,
        lastUpdateDuration: 0,
        serverState: 0,
        typeApi: '',
        api: '',
    },
    mutations: {
        EDIT_SERVER_STATE(state, value) {
            state.serverState = value;
        },
        EDIT_LAST_UPDATE_DURATION(state, value) {
            state.lastUpdateDuration = value;
        },
        EDIT_SERVER_PROBLEM(state, value) {
            state.serverProblem = value;
        },
        EDIT_TYPE_API(state, value) {
            state.typeApi = value;
        },
        EDIT_API(state, value) {
            state.api = value;
        },
    },
    actions: {
        updateServerProblem({ commit }, value) {
            commit('EDIT_SERVER_PROBLEM', value);
        },
        updateLastUpdate({ commit }, value) {
            commit('EDIT_LAST_UPDATE_DURATION', new Date() - value);
        },
        updateServerState({ commit }) {
            if (!this.state.serverProblem && this.state.lastUpdateDuration <= 60000) {
                commit('EDIT_SERVER_STATE', 0);
            } else {
                commit('EDIT_SERVER_STATE', 1);
            }
        },
        updateTypeApi({ commit }, value) {
            commit('EDIT_TYPE_API', value);
        },
        updateApi({ commit }, value) {
            commit('EDIT_API', value);
        },
    },
    getters: {
        serverProblem: (state) => {
            return state.serverProblem;
        },
        lastUpdateDuration: (state) => {
            return state.lastUpdateDuration;
        },
        serverState: (state) => {
            return state.serverState;
        },
        typeApi: (state) => {
            return state.typeApi;
        },
        api: (state) => {
            return state.typeApi;
        },
    },
});
