// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Node
const os = require( 'os' );
const path = require( 'path' );

// Vendor
const literati = require( 'sfco-literati' );

// Project
const DATA = require( '../data' );
const MESSAGES = DATA.MESSAGES;

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------
function init( options ) {
	options = ( typeof options === 'object' ) ? options : {};

	return literati.read( options.configPath || `${os.homedir()}/.timestamperrc` );
}

/// TODO[@jrmykolyn] - Replace `~` parsing logic with `untildify` package.
function resolvePath( pathStr ) {
	if ( !pathStr || typeof pathStr !== 'string' ) {
		return pathStr;
	}

	pathStr = ( pathStr.substring( 0, 1 ) === '~' ) ? ( `${os.homedir()}/${pathStr.substring( 1 )}`) : pathStr;
	pathStr = path.normalize( pathStr );

	return pathStr;
}

function getTimestamp() {
	var now = new Date();
	var today = new Date( now.getFullYear(), now.getMonth(), now.getDate() );

	return today.getTime();
}

function getDumpMsg( force ) {
	return `${getCommitMsg( force )}\n`;
}

function getCommitMsg( force ) {
	force = ( force === true );

	if ( force ) {
		return `${new Date().getTime()} | FORCE`;
	} else {
		return `${getTimestamp()} | DEFAULT`;
	}
}

function log( type, key ) {
	type = ( type && typeof type === 'string' ) ? type : 'error';
	key = ( key && typeof key === 'string' ) ? key : 'default';

	try {
		console.log( MESSAGES[ type ][ key ] );
	} catch ( err ) {
		console.log( 'Whoops! Something went REALLY wrong!' );
	}
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------
module.exports = {
	init,
	resolvePath,
	getTimestamp,
	getDumpMsg,
	getCommitMsg,
	log
};
