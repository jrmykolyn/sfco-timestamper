#! /usr/bin/env node

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
var literati = require( 'sfco-literati' );

// Project
const timestamper = require( './lib/timestamper' );
const CONFIG = require( './config' )
const DATA = require( './data' );
const MESSAGES = DATA.MESSAGES;

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const decoder = new StringDecoder( 'utf8' );
const ARGS = process.argv.slice( 2 );

var GLOBAL_CONFIG = CONFIG.configFile;
var REPO_PATH = CONFIG.repoPath;
var DUMP_FILE = CONFIG.dumpFile;

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------
function parsePathStr( pathStr ) {
	if ( !pathStr || typeof pathStr !== 'string' ) {
		return pathStr;
	}

	pathStr = ( pathStr.substring( 0, 1 ) === '~' ) ? ( `${os.homedir()}/${pathStr.substring( 1 )}`) : pathStr;
	pathStr = path.normalize( pathStr );

	return pathStr;
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

function getTimestamp() {
	var now = new Date();
	var today = new Date( now.getFullYear(), now.getMonth(), now.getDate() );

	return today.getTime();
}

function logMsg( type, key ) {
	type = ( type && typeof type === 'string' ) ? type : 'error';
	key = ( key && typeof key === 'string' ) ? key : 'default';

	try {
		console.log( MESSAGES[ type ][ key ] );
	} catch ( err ) {
		console.log( 'Whoops! Something went REALLY wrong!' );
	}
}

// --------------------------------------------------
// INIT
// --------------------------------------------------
// - Read `.timestamperrc` config. file.
// - Decode `Buffer` instance.
// - Parse JSON/
// - Update `REPO_PATH` and `DUMP_FILE` vars.
// - Parse/sanitize `pathStr`.
// - Read `DUMP_FILE`: proceed or throw error if program already run.
// - Append `DUMP_FILE` with message/timestamp for current day.
// - Commit updates.
// - Log 'success' message and git output.
timestamper.init( `${os.homedir()}/${GLOBAL_CONFIG}` )
	.then( ( data ) => { return decoder.write( data ); } )
	.then( ( data ) => { return JSON.parse( data ); } )
	.then( ( data ) => {
		// Update interval vars. with values extracted from config.
		REPO_PATH = ( data.repoPath && typeof data.repoPath === 'string' ) ? data.repoPath : REPO_PATH;
		DUMP_FILE = ( data.dumpFile && typeof data.dumpFile === 'string' ) ? data.dumpFile : DUMP_FILE;

		// ...
		return REPO_PATH;
	} )
	.then( ( pathStr ) => { return parsePathStr( pathStr ); } )
	.then( ( pathStr ) => {
		return literati.read( `${pathStr}/${DUMP_FILE}` )
			.then(
				( data ) => {
					if ( !decoder.write( data ).includes( getTimestamp() ) || ARGS.includes( '--force' ) ) {
						return pathStr;
					} else {
						throw new Error( 'Whoops! It looks like `timestamper` has already been invoked today. If you absolutely must pad your repo activity with another meaningless commit, add the `--force` flag.' );
					}
				},
				( err ) => {
					throw new Error( `Whoops! ${pathStr} directory either doesn't exist, or doesn't contain ${DUMP_FILE}. Please add this file before re-invoking the \`timestamper\` command.` );
				}
			)
 	} )
	.then( ( pathStr ) => {
		return new Promise( ( resolve, reject ) => {
			fs.appendFile( `${pathStr}/${DUMP_FILE}`, getDumpMsg( ARGS.includes( '--force' ) ), 'utf8', ( err, data ) => {
				if ( err ) {
					reject( err );
				} else {
					resolve( `${pathStr}/${DUMP_FILE}` );
				}
			} )
		} );
	} )
	.then( ( pathStr ) => {
		return new Promise( ( resolve, reject ) => {
			process.chdir( path.dirname( pathStr ) );

			var commitMsg = getCommitMsg( ARGS.includes( '--force' ) );

			exec( `git add ${DUMP_FILE} && git commit -m "${commitMsg}"`, ( err, stdout, stderr ) => {
				if ( err ) {
					throw new Error( `Whoops. Failed to commit updated ${DUMP_FILE} file.` );
				}

				resolve( stdout );
			} );
		} )
	} )
	.then( ( output ) => {
		logMsg( 'process', 'success' );
		console.log( output );
	} )
	.catch(
		( err ) => {
			if ( err.message ) {
				console.log( err.message );
			} else {
				logMsg( 'error', 'default' );
			}
		}
	);
