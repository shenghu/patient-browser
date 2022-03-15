import React         from "react"
import ReactDOM      from "react-dom"
import App           from "./components/App"
import { Provider }  from "react-redux"
import STORE    from "./redux"
import { fetch } from "./redux/query"
import {login, logout} from "./redux/user"
import { merge } from "./redux/settings"
import PatientDetail from "./components/PatientDetail"
import PatientList   from "./components/PatientList"
import { Router, Route, Switch } from "react-router"
import {createBrowserHistory} from "history"
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import jQuery    from "jquery"

window.$ = window.jQuery = jQuery

const history = createBrowserHistory()

ReactDOM.render(
    <ReactKeycloakProvider authClient={keycloak} onEvent = { (event, error) => {
        if (event === 'onAuthSuccess') {
          STORE.dispatch(login)
        } else if (event == 'onAuthLogout') {
          STORE.dispatch(logout)
        }
    }}
      onTokens={ (tokens)=>{
          if (!tokens.token)
            return;

          let {settings, query} = STORE.getState()
          console.debug(settings)
          console.debug(query)

          let initialLoad = false
          if (settings["auth-server-url"] && !settings.server.tokens && !query.bundle) {
              // Do initial load.
              initialLoad = true 
          } 

          STORE.dispatch(merge({server: {tokens}}))

          if (initialLoad)
            STORE.dispatch(fetch());
      }
          }>
    <Provider store={STORE}>
        <Router history={history}>
            <Switch>
                <App>
                    <Route path="/"               component={props=><PatientList {...props}/>} exact/>
                    <Route path="/patient-browser/"               component={props=><PatientList {...props}/>} exact/>
                    <Route path="/patient/:index" component={pros => <PatientDetail {...pros}/>}/>
                </App>
            </Switch>
        </Router>
    </Provider> 
    </ReactKeycloakProvider>,
    document.getElementById("main")
)

$(function () {
    $("body").tooltip({
        selector : ".patient-detail-page [title]"
    })
})