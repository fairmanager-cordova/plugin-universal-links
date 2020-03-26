/* eslint-disable no-console */
/*
Parser for config.xml file. Read plugin-specific preferences (from <universal-links> tag) as JSON object.
*/
const ConfigXmlHelper = require( "./configXmlHelper.js" );
const DEFAULT_SCHEME  = "http";

module.exports = {
	readPreferences : readPreferences
};

// region Public API

/**
 * Read plugin preferences from the config.xml file.
 *
 * @param {Object} cordovaContext - cordova context object
 * @return {Array} list of host objects
 */
function readPreferences( cordovaContext ) {
	// read data from projects root config.xml file
	const configXml = new ConfigXmlHelper( cordovaContext ).read();
	if( configXml === null ) {
		console.warn( "config.xml not found! Please, check that it exist's in your project's root directory." );
		return null;
	}

	// look for data from the <universal-links> tag
	const ulXmlPreferences = configXml.widget[ "universal-links" ];
	if( ulXmlPreferences === null || ulXmlPreferences.length === 0 ) {
		console.warn( "<universal-links> tag is not set in the config.xml. Universal Links plugin is not going to work." );
		return null;
	}

	const xmlPreferences = ulXmlPreferences[ 0 ];

	// read hosts
	const hosts = constructHostsList( xmlPreferences );

	// read ios team ID
	const iosTeamId = getTeamIdPreference( xmlPreferences );

	return {
		hosts : hosts,
		iosTeamId : iosTeamId
	};
}

// endregion

// region Private API

function getTeamIdPreference( xmlPreferences ) {
	if( Object.prototype.hasOwnProperty.call( xmlPreferences, "ios-team-id" ) ) {
		return xmlPreferences[ "ios-team-id" ][ 0 ].$.value;
	}

	return null;
}

/**
 * Construct list of host objects, defined in xml file.
 *
 * @param {Object} xmlPreferences - plugin preferences from config.xml as JSON object
 * @return {Array} array of JSON objects, where each entry defines host data from config.xml.
 */
function constructHostsList( xmlPreferences ) {
	const hostsList = [];

	// look for defined hosts
	const xmlHostList = xmlPreferences.host;
	if( xmlHostList === null || xmlHostList.length === 0 ) {
		return [];
	}

	xmlHostList.forEach( xmlElement => {
		const host = constructHostEntry( xmlElement );
		if( host ) {
			hostsList.push( host );
		}
	} );

	return hostsList;
}

/**
 * Construct host object from xml data.
 *
 * @param {Object} xmlElement - xml data to process.
 * @return {Object} host entry as JSON object
 */
function constructHostEntry( xmlElement ) {
	const host = {
		scheme : DEFAULT_SCHEME,
		name : "",
		paths : []
	};
	const hostProperties = xmlElement.$;

	if( hostProperties === null || hostProperties.length === 0 ) {
		return null;
	}

	// read host name
	host.name = hostProperties.name;

	// read scheme if defined
	if( hostProperties.scheme !== null ) {
		host.scheme = hostProperties.scheme;
	}

	// construct paths list, defined for the given host
	host.paths = constructPaths( xmlElement );

	return host;
}

/**
 * Construct list of path objects from the xml data.
 *
 * @param {Object} xmlElement - xml data to process
 * @return {Array} list of path entries, each on is a JSON object
 */
function constructPaths( xmlElement ) {
	if( xmlElement.path === null || xmlElement.path === undefined ) {
		return [ "*" ];
	}
	let paths = [];
	xmlElement.path.some( pathElement => {
		const url = pathElement.$.url;

		// Ignore explicit paths if '*' is defined
		if( url === "*" ) {
			paths = [ "*" ];
			return true;
		}

		paths.push( url );
		return false;
	} );

	return paths;
}

// endregion
