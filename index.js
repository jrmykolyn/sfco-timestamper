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

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------
const cli = meow();

// --------------------------------------------------
// INIT
// --------------------------------------------------
/// TODO: This is gnarly. Make it... not?
if ( cli.flags.init ) {
	timestamper.init()
		.then( ( config ) => {
			if ( !config.alreadyInitialized ) {
				console.log( 'Successfully initialized `timestamper`:' );
			} else {
				console.log( 'Looks like `timestamper` has already been initialized. To configure, adjust the file below:' );
			}

			console.log( config.path );
		} )
		.catch( ( err ) => {
			console.log( 'Whoops! Something went wrong!' );
		} );
} else {
	timestamper.run( cli.input, cli.flags )
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
}
