'use strict';
var AWS = require( 'aws-sdk' );
exports.backup = ( event, context, callback ) => {
    console.log( 'Deep Security RDS Demo' );
    const message = event.Records[ 0 ].Sns.Message;
    var jsonContent = JSON.parse( message );
    var instance = jsonContent[ 0 ].HostInstanceID;
    var EventID = jsonContent[ 0 ].EventID;

    var rds = new AWS.RDS( { region: process.env.AWS_REGION } );
    var lambda = new AWS.Lambda( { apiVersion: '2015-03-31' } );
    console.log( 'Instance ID: ' + instance );
    //Check if it meets Requirements based on Environment Variables
        if ( jsonContent[ 0 ].ActionString == process.env.ActionString && jsonContent[ 0 ].Reason == process.env.Reason && jsonContent[ 0 ].HostSecurityPolicyName == process.env.HostSecurityPolicyName ) {
        var logmessage = 'Wordpress API Vulnerability Blocked, A snapshot for DB instance ' + DBInstanceIdentifier + ' has been generated.';
        var DBSnapshotID = 'deepsecurity-event-backup-' + EventID;
        console.log( logmessage );
        console.log( DBSnapshotID );
        var BackupParams = {
            DBInstanceIdentifier: process.env.DBInstanceIdentifier,
            DBSnapshotIdentifier: DBSnapshotID
        };
        rds.createDBSnapshot( BackupParams, function( err, data ) {
            if ( err ) {
                console.log( err, err.stack );
            } else {
                console.log( data );
                var messageParams = {
                    FunctionName: process.env.FunctionName,
                    Payload: '{"message": "' + logmessage + '", "subject": "Wordpress Exploit Alert for ' + instance + '"}'
                };
                lambda.invoke( messageParams, function( err, data ) {
                    if ( err ) console.log( err, err.stack ); // an error occurred
                    else console.log( data ); // successful response
                } );
                console.log( data );

            }
        } );
    } else {
        console.log( 'Event did not hit the Specific Requirements' );
    }
    callback( null, message );
};
