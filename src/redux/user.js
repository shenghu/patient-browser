import { createAction, handleActions } from "redux-actions"
import mixinDeep from "mixin-deep";

// Private action constants
const LOGIN                = "app/user/LOGIN"
const LOGOUT              = "app/user/LOGOUT"

const ANONYMOUS_USER = 'Anonymous'

// Create (and export) the redux actions
export const login            = createAction(LOGIN)
export const logout          = createAction(LOGOUT)

const INITIAL_STATE = {
    authenticated: false,
    username: ANONYMOUS_USER
}

// Export the reducer as default
export default handleActions({

    [LOGIN]: (state, action) => mixinDeep(state, action.payload, { authenticated: true }),

    [LOGOUT]: (state, action) => ({
        ...state,
        authenticated: false
    })
}, INITIAL_STATE)
