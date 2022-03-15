import Keycloak from 'keycloak-js'
import { parseQueryString } from './lib'

const DEFAULT_CONFIG = "default";
let { config } = parseQueryString(window.location.search);
const keycloak = new Keycloak(`./config/${config || DEFAULT_CONFIG}.json5`,);
export default keycloak
