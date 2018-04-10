// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Node
const os = require( 'os' );
const fs = require( 'fs' );
const path = require( 'path' );
const execSync = require( 'child_process' ).execSync;
const StringDecoder = require( 'string_decoder' ).StringDecoder;

// Vendor
const Configstore = require( 'configstore' );

// Project
const pkg = require( '../package' );
const CONFIG = require( '../config' );

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const conf = new Configstore( pkg.name, {} );
const decoder = new StringDecoder( 'utf8' );

let OPTS;
let REPO_PATH;
let DUMP_FILE;

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------
/**
 * Used to create the config. file (generated on script execution).
 *
 * Returns an immediately resolved Promise.
 *
 * @return {Promise}
 * @fulfills {Object}
 *
 * /// TODO: Consider making this interactive?
 */
function init() {
	let alreadyInitialized = !!conf.get( 'repoPath' );

	// Migrate 'defaults' to new config.
	Object.keys( CONFIG.defaults ).forEach( ( key ) => {
		conf.set( key, CONFIG.defaults[ key ] );
	} );

	return new Promise( ( resolve ) => {
		resolve( {
			path: conf.path,
			data: conf.all,
			alreadyInitialized,
		} );
	} );
}

/**
 * Function is a wrapper around the core `Timestamper` logic.
 *
 * @param {Object} `options`
 * @return {Promise}
 */
function run( options ) {
	OPTS = options;


	return new Promise( ( resolve ) => {
		// Update internal vars. with values extracted from config.
		REPO_PATH = conf.get( 'repoPath' ) || CONFIG.defaults.repoPath;
		DUMP_FILE = conf.get( 'dumpFile' ) || CONFIG.defaults.dumpFile;

		// Concat. and return path to 'dump file'.
		resolve( `${REPO_PATH}/${DUMP_FILE}` );
	} )
		.then( resolvePath )
		.then( validatePath )
		.then( checkFileContents )
		.then( updateFileContents )
		.then( commitUpdates );
}

/**
 * Given a `pathStr`, function:
 * - Replaces the leading tilde chracacter with the user's home dir. path (if found).
 * - Resolves './' and/or '../' path segments (if found).
 *
 * @param {string} `pathStr`
 * @return {string}
 */
function resolvePath( pathStr ) {
	if ( !pathStr || typeof pathStr !== 'string' ) {
		return pathStr;
	}

	pathStr = ( pathStr.substring( 0, 1 ) === '~' ) ? ( `${os.homedir()}/${pathStr.substring( 1 )}` ) : pathStr;
	pathStr = path.normalize( pathStr );

	return pathStr;
}

/**
 * Validate `pathStr` and pass through, or error.
 *
 * @param {string} pathStr
 * @return string
 */
function validatePath( pathStr ) {
	if ( !fs.existsSync( pathStr ) ) {
		throw new Error( `Whoops! It looks like ${pathStr} doesn't exist. Please ensure that ${path.dirname( pathStr )} exists, is a directory, and contains the ${DUMP_FILE} file before invoking the \`timestamper\` command.` );
	}

	return pathStr;
}

/**
 * Check for presence of timestamp in file at `pathStr`.
 *
 * If found, error. Otherwise, pass through.
 *
 * @param {string} pathStr
 * @return string
 */
function checkFileContents( pathStr ) {
	if ( ( fs.readFileSync( pathStr, { encoding: 'utf8' } ) ).includes( getTodayAsTimestamp() ) && !OPTS.force ) {
		throw new Error( getMsg( 'error', 'limit' ) );
	}

	return pathStr;
}

/**
 * Add timestamp to file at `pathStr`.
 *
 * @param {string} `pathStr`
 * @return string
 */
function updateFileContents( pathStr ) {
	try {
		fs.appendFileSync( pathStr, getDumpMsg( OPTS.force ), { encoding: 'utf8' } );

		return pathStr;
	} catch( err ) {
		throw new Error( err );
	}
}

/**
 * Commit updates made to file at `pathStr`.
 *
 * Return output from commit, or error.
 *
 * @param {string} pathStr
 * @return string
 */
function commitUpdates( pathStr ) {
	try {
		process.chdir( path.dirname( pathStr ) );
		return execSync( `git add ${DUMP_FILE} && git commit -m "${getCommitMsg( OPTS.force )}"`, { encoding: 'utf8' } );
	} catch ( err ) {
		throw new Error( err );
	}
}

/**
 * Function returns the timestamp for the current day.
 *
 * @return {string}
 */
function getTodayAsTimestamp() {
	var now = new Date();
	var today = new Date( now.getFullYear(), now.getMonth(), now.getDate() );

	return today.getTime();
}

/**
 * Function returns the string which will be added/appended to the 'dump file'.
 *
 * @param {boolean} `force`
 * @return {string}
 */
function getDumpMsg( force ) {
	return `${getCommitMsg( force )}\n`;
}

/**
 * Function returns a 'default' commit message string. 'Default' commit message includes a timestamp for the current day.
 *
 * If invoked with the `force` argument, function returns the 'force' commit message string.
 *
 * @param {boolean} `force`
 * @return {string}
 */
function getCommitMsg( force ) {
	force = ( force === true );

	if ( force ) {
		return `${new Date().getTime()} | FORCE`;
	} else {
		return `${getTodayAsTimestamp()} | DEFAULT`;
	}
}

/**
 * Given a `type` and `key`, function returns the corresponding message string from the config.
 *
 * If a string cannot be matched, function returns a default error string.
 *
 * @param {string} `type`
 * @param {string} `key`
 * @return {string}
 */
function getMsg( type, key ) {
	type = ( type && typeof type === 'string' ) ? type : 'error';
	key = ( key && typeof key === 'string' ) ? key : 'default';

	try {
		return CONFIG.messages[ type ][ key ];
	} catch ( err ) {
		return 'Whoops! Something went REALLY wrong!';
	}
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------
module.exports = {
	init,
	run,
	getMsg,
};
