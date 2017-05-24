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

// Project
const DATA = require( '../data' );
const MESSAGES = DATA.MESSAGES;
const CONFIG = require( '../config' )

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const decoder = new StringDecoder( 'utf8' );

var GLOBAL_CONFIG = CONFIG.configFile;
var REPO_PATH = CONFIG.repoPath;
var REPO_NAME = CONFIG.repoName;
var DUMP_FILE = CONFIG.dumpFile;

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------
function init( args ) {
	return literati.read( `${os.homedir()}/${GLOBAL_CONFIG}` )
		.then( ( data ) => { return decoder.write( data ); } )
		.then( ( data ) => { return JSON.parse( data ); } )
		.then( ( data ) => {
			// Update internal vars. with values extracted from config.
			REPO_PATH = ( data.repoPath && typeof data.repoPath === 'string' ) ? data.repoPath : REPO_PATH;
			REPO_NAME = ( data.repoName && typeof data.repoName === 'string' ) ? data.repoName : REPO_NAME;
			DUMP_FILE = ( data.dumpFile && typeof data.dumpFile === 'string' ) ? data.dumpFile : DUMP_FILE;

			// ...
			return `${REPO_PATH}/${REPO_NAME}/${DUMP_FILE}`;
		} )
		.then( ( pathStr ) => { return resolvePath( pathStr ); } )
		.then( ( pathStr ) => {
			return literati.read( pathStr )
				.then(
					( data ) => {
						if ( !decoder.write( data ).includes( getTimestamp() ) || args.includes( '--force' ) ) {
							return pathStr;
						} else {
							throw new Error( getMsg( 'error', 'limit' ) );
						}
					},
					( err ) => {
						throw new Error( `Whoops! ${pathStr} directory either doesn't exist, or doesn't contain ${DUMP_FILE}. Please ensure that ${path.dirname( pathStr )} exists, is a directory, and contains the ${DUMP_FILE} file before invoking the \`timestamper\` command.` );
					}
				)
		} )
		.then( ( pathStr ) => {
			return new Promise( ( resolve, reject ) => {
				fs.appendFile( pathStr, getDumpMsg( args.includes( '--force' ) ), 'utf8', ( err, data ) => {
					if ( err ) {
						reject( err );
					} else {
						resolve( pathStr );
					}
				} )
			} );
		} )
		.then( ( pathStr ) => {
			return new Promise( ( resolve, reject ) => {
				process.chdir( path.dirname( pathStr ) );

				var commitMsg = getCommitMsg( args.includes( '--force' ) );

				exec( `git add ${DUMP_FILE} && git commit -m "${commitMsg}"`, ( err, stdout, stderr ) => {
					if ( err ) {
						throw new Error( `Whoops. Failed to commit updated ${DUMP_FILE} file.` );
					}

					resolve( stdout );
				} );
			} )
		} );
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

function getMsg( type, key ) {
	type = ( type && typeof type === 'string' ) ? type : 'error';
	key = ( key && typeof key === 'string' ) ? key : 'default';

	try {
		return MESSAGES[ type ][ key ];
	} catch ( err ) {
		return 'Whoops! Something went REALLY wrong!';
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
	getMsg
};
