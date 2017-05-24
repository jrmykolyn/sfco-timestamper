#! /usr/bin/env node

// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Project
const timestamper = require( './lib/timestamper' );

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const ARGS = process.argv.slice( 2 );

// --------------------------------------------------
// INIT
// --------------------------------------------------
// - Read `.timestamperrc` config. file.
// - Decode `Buffer` instance.
// - Parse JSON.
// - Update `REPO_PATH` and `DUMP_FILE` vars.
// - Parse/sanitize `pathStr`.
// - Read `DUMP_FILE`: proceed or throw error if program already run.
// - Append `DUMP_FILE` with message/timestamp for current day.
// - Commit updates.
// - Log 'success' message and git output.
/// TODO[@jrmykolyn] - Move comments into `lib/timestamper.js`.
timestamper.init( ARGS )
	.then( ( output ) => {
		console.log( timestamper.getMsg( 'process', 'success' ) );
		console.log( output );
	} )
	.catch(
		( err ) => {
			if ( err.message ) {
				console.log( err.message );
			} else {
				console.log( timestamper.getMsg( 'error', 'default' ) );
			}
		}
	);
