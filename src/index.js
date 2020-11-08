import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from "redux";

import { API_KEY, USER, GET_STORAGE, SET_STORAGE, REMOVE_STORAGE, AJAX_SERVICE_LOGIN_REQUEST, GET_COOKIE, DELETE_LOGIN_COOKIE } from "./Constants/AppConstants";
import { setCurrentUser } from "./Store/actions/loginActions";
import reducer from "./Store/reducers/reducer";
import history from "./history";

const store = createStore(
    reducer,
    compose(
        applyMiddleware(thunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
    )
);

const cur_cookie = GET_COOKIE(USER);
if (cur_cookie) {
    const cur_cookie_parse = JSON.parse(GET_COOKIE(USER));
    SET_STORAGE(USER, JSON.stringify(cur_cookie_parse));
}

const cur_storage = JSON.parse(GET_STORAGE(USER));
if (cur_storage) {
    // setAuthorizationToken(localStorage.plu);
    if (cur_storage.token) {
        const request_result = AJAX_SERVICE_LOGIN_REQUEST("POST", "user/details", {
            user_token: cur_storage.token,
            api_key: API_KEY,
        });
        request_result.then(results => {
            if (results.response.code === 1000) {
                let user_data = results.response.data;
                SET_STORAGE(USER, JSON.stringify(user_data));
                store.dispatch(setCurrentUser(JSON.parse(GET_STORAGE(USER))));

            } else {
                REMOVE_STORAGE(USER);
                DELETE_LOGIN_COOKIE();
                store.dispatch(setCurrentUser({}));
            }
        });
    } else {
        REMOVE_STORAGE(USER);
        store.dispatch(setCurrentUser({}));
    }
}

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
    document.getElementById("root")
);

serviceWorker.unregister();
