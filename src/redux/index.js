/**
 * The purpose of this file is to combine reducers and create the single store.
 * One should use it simply like so:
 *
 * ```import STORE from "./redux"```
 */
import { createStore, applyMiddleware, combineReducers } from "redux"
import thunk     from "redux-thunk"
import selection from "./selection"
import query     from "./query"
import settings  from "./settings"
import urlParams from "./urlParams"
import user from "./user"

const middleWares = [thunk]

// Create logger middleware that will log all redux action but only
// use that in development env.
if (process.env.NODE_ENV == "development" && console && console.groupCollapsed) {
    let logger = _store => next => action => {
        let result;
        if (!action.__no_log) {
            console.groupCollapsed(action.type)
            console.info("dispatching", action)
            result = next(action)
            console.log("next state", _store.getState())
            console.groupEnd(action.type)
        }
        else {
            result = next(action)
        }
        return result
    }

    middleWares.push(logger)
}

export default createStore(
    combineReducers({
        selection,
        query,
        settings,
        urlParams,
        user
    }),
    applyMiddleware(...middleWares)
);
