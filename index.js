#! /usr/bin/env node

// --------------------------------------------------
// IMPORT MODULES
// --------------------------------------------------
// Node
// Vendor
// Project

// --------------------------------------------------
// DECLARE VARS
// --------------------------------------------------

// --------------------------------------------------
// DECLARE FUNCTIONS
// --------------------------------------------------

// --------------------------------------------------
// INIT
// --------------------------------------------------
// CHECK FOR `GLOBAL_CONFIG` IN USER HOME DIR.
// IF NOT FOUND
    // PROMPT INIT
        // IF INIT ACCEPTED
            // DO INIT
            // CREATE `GLOBAL_CONFIG`
            // PRINT MESSAGE: 'Initialization complete'
        // ELSE
            // PRINT MESSAGE: 'Initialization required'
            // EXIT
// READ `GLOBAL_CONFIG`
// VALIDATE PRESENCE OF `path` KEY (EG. 'target' REPO)
// VALIDATE PRESENCE OF `README.md` FILE IN 'target' REPO
// ADD TIMESTAMP TO `README.md` FILE
// STAGE AND COMMIT UPDATES
// PRINT MESSAGE: 'Updated "README" and committed changes'
// EXIT