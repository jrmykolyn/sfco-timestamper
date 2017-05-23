// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Node
const os = require( 'os' );

// Vendor
const literati = require( 'sfco-literati' );

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------
function init( options ) {
	options = ( typeof options === 'object' ) ? options : {};

	return literati.read( options.configPath || `${os.homedir()}/.timestamperrc` );
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

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------
module.exports = {
	init,
	getTimestamp,
	getDumpMsg,
	getCommitMsg
};
