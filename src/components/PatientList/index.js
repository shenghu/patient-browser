import React               from "react"
import { useDispatch, useSelector } from 'react-redux';
import PropTypes            from "prop-types"
import PatientListItem      from "../PatientListItem"
import { toggle, setAll }   from "../../redux/selection"
import { showSelectedOnly } from "../../redux/settings"
import { setParam, fetch }  from "../../redux/query"
import store                from "../../redux"
import Footer               from "../Footer"
import Header               from "../Header"
import ErrorMessage         from "../ErrorMessage"
import Alert                from "../Alert"
import                           "./PatientList.less"
import keycloak from "../../keycloak";


export  const PatientList = (props)=>
{
    const state = useSelector((store) => store);
    const dispatch = useDispatch();

    const renderContents = () => {
        if (state.query.error) {
            return <ErrorMessage error={state.query.error}/>
        }

        if (!state.query.bundle || state.query.loading) {
            return (
                <div className="patient-search-loading">
                    <i className="fa fa-spinner spin" /> Loading. Please wait...
                </div>
            )
        }

        if (!state.query.bundle.entry || !state.query.bundle.entry.length) {
            return (
                <Alert>
                    No patients found to match this search criteria
                </Alert>
            )
        }

        return renderPatientItems()
    };

    const renderPatientItems = () => {
        const isSelected = (item) => {
            let idLower = (item.resource.id || "").toLowerCase();
            let key = Object.keys(state.selection).find(k => k.toLowerCase() == idLower);
            return key && state.selection[key] !== false;
        }

        let offset = state.query.offset || (state.query.page !== null ? (state.query.page - 1) * state.query.limit : null) || 0;
        let items = state.query.bundle.entry || [];
        if (state.settings.renderSelectedOnly) {
            items = items.filter(isSelected);
        }
        return items.map((o, i) => (
            <PatientListItem
                { ...o.resource }
                patient={ o.resource }
                key={ o.resource.id }
                index={ offset + i }
                selected={ isSelected(o) }
                onSelectionChange={ patient => {
                    if (state.settings.renderSelectedOnly &&
                        Object.keys(state.selection).filter(k => !!state.selection[k]).length === 1)
                    {
                        store.dispatch(setAll({}))
                        store.dispatch(showSelectedOnly(false))
                        store.dispatch(setParam({ name: "_id", value: undefined }))
                        store.dispatch(fetch())
                    }
                    else {
                        store.dispatch(toggle(patient))
                    }
                }}
                query={ state.query }
                settings={ state.settings }
            />
        ))
    };

    return (
            <div className="page">
                <Header
                    query={state.query}
                    settings={state.settings}
                    location={props.location}
                    urlParams={state.urlParams}
                    user={state.user}
                />
                {keycloak.authenticated? <div className="patient-search-results">
                    { renderContents() }
                </div> :               <Alert>
                    Please login first
                </Alert>
                }
        
                <Footer
                    query={ state.query }
                    bundle={ state.query.bundle }
                    dispatch={ dispatch }
                    selection={ state.selection }
                    canShowSelected
                />
            </div>
    );
}

PatientList.propTypes = {
    location : PropTypes.object
}

export default PatientList