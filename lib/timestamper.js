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

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------
module.exports = {
	init
};
