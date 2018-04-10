// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Node
const os = require( 'os' );
const fs = require( 'fs' );
const path = require( 'path' );
const exec = require( 'child_process' ).exec;
const StringDecoder = require( 'string_decoder' ).StringDecoder;

// Vendor
const literati = require( 'sfco-literati' );
const Configstore = require( 'configstore' );

// Project
const pkg = require( '../package' );
const CONFIG = require( '../config' );

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const conf = new Configstore( pkg.name, {} );
const decoder = new StringDecoder( 'utf8' );

let ARGS;
let OPTS;

var REPO_PATH;
var DUMP_FILE;

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
 * @param {Array} `args`
 * @return {Promise}
 */
function run( args, options ) {
	ARGS = args;
	OPTS = options;

	return new Promise( ( resolve ) => {
		// Update internal vars. with values extracted from config.
		REPO_PATH = conf.get( 'repoPath' ) || CONFIG.defaults.repoPath;
		DUMP_FILE = conf.get( 'dumpFile' ) || CONFIG.defaults.dumpFile;

		// Concat. and return path to 'dump file'.
		resolve( `${REPO_PATH}/${DUMP_FILE}` );
	} )
		.then( ( pathStr ) => { return resolvePath( pathStr ); } )
		.then( ( pathStr ) => {
			return literati.read( pathStr )
				.then(
					( data ) => {
						if ( !decoder.write( data ).includes( getTodayAsTimestamp() ) || OPTS.force ) {
							return pathStr;
						} else {
							throw new Error( getMsg( 'error', 'limit' ) );
						}
					},
					() => {
						throw new Error( `Whoops! It looks like ${pathStr} doesn't exist. Please ensure that ${path.dirname( pathStr )} exists, is a directory, and contains the ${DUMP_FILE} file before invoking the \`timestamper\` command.` );
					}
				);
		} )
		.then( ( pathStr ) => {
			return new Promise( ( resolve, reject ) => {
				fs.appendFile( pathStr, getDumpMsg( OPTS.force ), 'utf8', ( err ) => {
					if ( err ) {
						reject( err );
					} else {
						resolve( pathStr );
					}
				} );
			} );
		} )
		.then( ( pathStr ) => {
			return new Promise( ( resolve, reject ) => {
				process.chdir( path.dirname( pathStr ) );

				var commitMsg = getCommitMsg( OPTS.force );

				exec( `git add ${DUMP_FILE} && git commit -m "${commitMsg}"`, ( err, stdout ) => {
					if ( err ) {
						reject( new Error( `Whoops. Failed to commit updated ${DUMP_FILE} file.` ) );
					}

					resolve( stdout );
				} );
			} );
		} );
}

/**
 * Given a `pathStr`, function:
 * - Replaces the leading tilde chracacter with the user's home dir. path (if found).
 * - Resolves './' and/or '../' path segments (if found).
 *
 * @param {string} `pathStr`
 * @return {string}
 */
 /// TODO[@jrmykolyn] - Replace `~` parsing logic with `untildify` package.
function resolvePath( pathStr ) {
	if ( !pathStr || typeof pathStr !== 'string' ) {
		return pathStr;
	}

	pathStr = ( pathStr.substring( 0, 1 ) === '~' ) ? ( `${os.homedir()}/${pathStr.substring( 1 )}` ) : pathStr;
	pathStr = path.normalize( pathStr );

	return pathStr;
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
