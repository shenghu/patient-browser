import React     from "react"
import PropTypes from "prop-types"
import            "./Header.less"
import {
    fetch,
    setGender,
    setAgeGroup,
    setMinAge,
    setMaxAge,
    setConditions,
    setTags,
    setParam,
    setQueryString,
    setQueryType,
    setSort
} from "../../redux/query"
import store       from "../../redux"
import TagSelector from "../TagSelector"
import AgeSelector from "../AgeSelector"
import SortWidget  from "../SortWidget"
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { useKeycloak } from "@react-keycloak/web";

import {
    parseQueryString,
    setHashParam
} from "../../lib"
import { useSelector } from "react-redux"

export const Header = (props)=>
{
    const dispatchFetch = (delay=500) => {
        if (props.settings.submitStrategy == "automatic") {
            if (fetchDelay) {
                clearTimeout(fetchDelay);
            }
            fetchDelay = setTimeout(() => {
                store.dispatch(fetch())
            }, delay)
        }
        // else {
        //     store.dispatch(fetch())
        // }
    }

    const renderUserMenu = ()=>{
        const { keycloak } = useKeycloak();

    const user = useSelector((store) => store.user)
        
        return (
            <>
            <Dropdown className="pull-right advanced-label" as={ButtonGroup}>
                <Dropdown.Toggle id="user">{keycloak.authenticated?keycloak.tokenParsed.preferred_username:"Not Login"}</Dropdown.Toggle>
                <Dropdown.Menu className="user-menu" >
                    {!!keycloak.authenticated && (<Dropdown.Item eventKey="1" onClick={() => keycloak.logout()}>Logout</Dropdown.Item>)}
                    {!keycloak.authenticated && (<Dropdown.Item eventKey="1" onClick={() => keycloak.login()}>Login</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>
        </> 
        )
    }

    const renderAdvancedTabContents = ()=>{
        return (
            <div className="form-group">
                <p className="text-warning" style={{ padding: "0 5px 5px", margin: 0 }}>
                    <i className="fa fa-info-circle" /> In advanced mode, provide a
                    query string to browse and select from a list of matching
                    patients. <a target="_blank" href="http://hl7.org/fhir/patient.html#search">More Info...</a>
                </p>
                <form onSubmit={ e => {
                    e.preventDefault()
                    store.dispatch(fetch())
                }}>
                    <div className="input-group input-group-sm">
                        <span className="input-group-addon">/Patient?</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Patient Search Query String"
                            name="query"
                            onChange={ e => store.dispatch(setQueryString(e.target.value)) }
                            value={ props.query.queryString }
                        />
                        <span className="input-group-btn">
                            <button className="btn btn-warning" type="submit">Go</button>
                        </span>
                    </div>
                </form>
            </div>
        )
    }

    const renderDemographicsTabContents = () => {
        return (
            <form onSubmit={ e => {
                e.preventDefault()
                store.dispatch(fetch())
            }}>
                <div className="row">
                    <div className={ "**custom**" === props.query.ageGroup ? "col-sm-6" : "col-sm-12" }>
                        <div className="form-group">
                            {/*<label>Name:</label>*/}
                            <div className="input-group">
                                <span className="input-group-addon"><small>Name:</small></span>
                                <input
                                    type="text"
                                    className="form-control input-sm"
                                    placeholder="Search by name..."
                                    value={ props.query.params.name || "" }
                                    onChange={e => {
                                        store.dispatch(setParam({
                                            name : "name",
                                            value: e.target.value
                                        }))
                                        dispatchFetch()
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            {/*<label>Gender:</label>*/}
                            <select
                                className="form-control input-sm"
                                onChange={ e => {
                                    store.dispatch(setGender(e.target.value))
                                    dispatchFetch()
                                }}
                                value={ props.query.gender || "" }
                            >
                                <option value="male">Males</option>
                                <option value="female">Females</option>
                                <option value="">Any Gender</option>
                            </select>
                        </div>
                    </div>
                    <div className={ "**custom**" === props.query.ageGroup ? "col-sm-12" : "col-sm-6" }>
                        <div className="form-group">
                            {/*<label>Age:</label>*/}
                            <AgeSelector
                                min={ props.query.minAge || { value: 0  , units: "years" } }
                                max={ props.query.maxAge || { value: 100, units: "years" } }
                                onMinChange={ age => {
                                    store.dispatch(setMinAge(age))
                                    //if ("**custom**" != props.query.ageGroup) {
                                    dispatchFetch()
                                    //}
                                }}
                                onMaxChange={ age => {
                                    store.dispatch(setMaxAge(age))
                                    //if ("**custom**" != props.query.ageGroup) {
                                    dispatchFetch()
                                    //}
                                }}
                                onGroupChange={ group => {
                                    store.dispatch(setAgeGroup(group))
                                    //if ("**custom**" != props.query.ageGroup) {
                                    dispatchFetch()
                                    //}
                                }}
                                //update={ () => fetch() }
                                group={ props.query.ageGroup }
                            />
                        </div>
                    </div>
                </div>
            </form>
        )
    }

    const renderConditionsTabContents = () => {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <TagSelector
                            tags={
                                Object.keys(props.settings.server.conditions).map(key => {
                                    let condition = props.settings.server.conditions[key];
                                    return {
                                        key,
                                        label: condition.description,
                                        data : condition
                                    }
                                })
                            }
                            onChange={
                                selection => {
                                    let conditions = {}
                                    selection.forEach(tag => {
                                        conditions[tag.key] = tag.data
                                    })
                                    store.dispatch(setConditions(conditions))
                                    dispatchFetch()
                                }
                            }
                            label="condition code"
                            selected={ Object.keys(props.query.conditions) }
                        />
                    </div>
                </div>
            </div>
        )
    }

    const renderTagsTabContents = ()=> {
        let selected = props.query.tags || props.settings.server.tags.filter(
            tag => !!tag.selected
        ).map(tag => !!tag.key);
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <TagSelector
                            tags={ props.settings.server.tags }
                            selected={ selected }
                            onChange={
                                sel => {
                                    let tags = Object.keys(sel).map(k => sel[k].key)
                                    store.dispatch(setTags(tags))
                                    dispatchFetch()
                                }
                            }
                            label="tag"
                        />
                    </div>
                </div>
            </div>
        )
    }

   
        let _query    = parseQueryString(props.location.search);
        let _advanced = props.query.queryType == "advanced";
        let conditionsCount   = Object.keys(props.query.conditions).length;
        let demographicsCount = 0;
        let tagsCount         = Object.keys(props.query.tags).length;

        // Compute which the active tab should be
        let tabs = ["demographics", "conditions"];
        if (!props.settings.hideTagSelector) {
            tabs.push("tags");
        }
        let _tab = _query._tab || "";
        if (tabs.indexOf(_tab) == -1) {
            _tab = "demographics";
        }

        // Manually increment the value for the demographics badge depending on
        // the state of the app

        if (props.query.gender) {
            demographicsCount += 1;
        }

        if (props.query.params.name) {
            demographicsCount += 1;
        }

        if (props.query.maxAge !== null || props.query.minAge !== null) {
            demographicsCount += 1;
        }

        return (
            <div className="app-header">
                <div style={{ flexDirection: "row" }}>
         {renderUserMenu()}
                    <label className="pull-right advanced-label text-warning">
                        Advanced <span className="hidden-xs">Mode </span> <input
                            type="checkbox"
                            checked={ _advanced }
                            onChange={ e => {
                                store.dispatch(setQueryType(e.target.checked ? "advanced" : "basic"))
                            }}
                        />
                    </label>
                {
                    _advanced ?
                    <ul className="nav nav-tabs"/> :
                    <ul className="nav nav-tabs">
                        <li className={ !_advanced && _tab == "demographics" ? "active" : null }>
                            <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "demographics")}}>
                                <b>Demographics</b>
                                {
                                    demographicsCount ?
                                    <span className="hidden-xs"> <small className="badge">{ demographicsCount }</small></span> :
                                    null
                                }
                            </a>
                        </li>
                        <li className={ !_advanced && _tab == "conditions" ? "active" : null }>
                            <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "conditions")}}>
                                <b>Conditions</b>
                                {
                                    conditionsCount ?
                                    <span className="hidden-xs"> <small className="badge">{ conditionsCount }</small></span> :
                                    null
                                }
                            </a>
                        </li>
                        {
                            (props.settings.hideTagSelector ||
                            props.query.params._id) ?
                            null :
                            <li className={ !_advanced && _tab == "tags" ? "active" : null }>
                                <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "tags")}}>
                                    <b>Tags</b>
                                    {
                                        tagsCount ?
                                        <span className="hidden-xs"> <small className="badge">{ tagsCount }</small></span> :
                                        null
                                    }
                                </a>
                            </li>
                        }
                    </ul>
                }
                </div>
                <div className="tab-content">
                    <div className={ "tab-pane " + (_advanced ? "active" : "") }>
                        { renderAdvancedTabContents() }
                    </div>
                    <div className={ "tab-pane " + (!_advanced && _tab == "demographics" ? "active" : "") }>
                        { renderDemographicsTabContents() }
                    </div>
                    <div className={ "tab-pane " + (!_advanced && _tab == "conditions" ? "active" : "") }>
                        { renderConditionsTabContents() }
                    </div>
                    {
                        (props.settings.hideTagSelector ||
                            props.query.params._id) ?
                        null :
                        <div className={ "tab-pane " + (!_advanced && _tab == "tags" ? "active" : "") }>
                            { renderTagsTabContents() }
                        </div>
                    }
                    {
                        !_advanced && props.settings.submitStrategy == "manual" ?
                        <div className="text-right" style={{ height: 0 }}>
                            <button
                                type="button"
                                onClick={ () => store.dispatch(fetch()) }
                                className="btn btn-primary btn-submit"
                            >
                                <i className="fa fa-search"/> Search
                            </button>
                        </div> :
                        null
                    }
                </div>
                {
                    _advanced ?
                    null :
                    <SortWidget
                        sort={ props.query.sort }
                        onChange={ sort => {
                            store.dispatch(setSort(sort))
                            store.dispatch(fetch())
                        }}
                    />
                }
            </div>
        )
    
}

Header.propTypes = {
    settings : PropTypes.object.isRequired,
    query    : PropTypes.object.isRequired,
    location : PropTypes.object.isRequired,
    urlParams: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

export default Header
