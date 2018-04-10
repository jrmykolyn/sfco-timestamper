#! /usr/bin/env node

/* eslint-disable
	no-console
*/

// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Vendor
const meow = require( 'meow' );

// Project
const timestamper = require( './lib/timestamper' );
const { getMsg } = timestamper;

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const cli = meow();

// --------------------------------------------------
// INIT
// --------------------------------------------------
// Handle initialization.
if ( cli.flags.init ) {
	timestamper.init()
		.then( ( config ) => {
			console.log( !config.alreadyInitialized ? getMsg( 'init', 'success' ) : getMsg( 'init', 'duplicate' ) );
			console.log( config.path );
		} )
		.catch( () => {
			console.log( getMsg( 'error', 'default' ) );
		} );
// Handle normal execution/invocation.
} else {
	timestamper.run( cli.flags )
		.then( ( output ) => {
			console.log( getMsg( 'process', 'success' ) );
			console.log( output );
		} )
		.catch(
			( err ) => {
				console.log( err.message || getMsg( 'error', 'default' ) );
			}
		);
}
