'use strict';
var AWS = require( 'aws-sdk' );
exports.ac = ( event, context, callback ) => {
    console.log( 'Deep Security App Control Demo' );
    //Parse Message
    const message = event.Records[ 0 ].Sns.Message;
    var jsonContent = JSON.parse( message );

    //Get Instance ID
    var instance = jsonContent[ 0 ].HostInstanceID;
  
    //Instantiate Functions
    var ec2 = new AWS.EC2( { region: process.env.AWS_REGION } );
    var lambda = new AWS.Lambda( { apiVersion: '2015-03-31' } );

    //Check if it passes All Conditions
    if ( jsonContent[ 0 ].HostSecurityPolicyName == process.env.HostSecurityPolicyName && jsonContent[ 0 ].Action == process.env.Action && jsonContent[ 0 ].OperationDesc == process.env.OperationDesc ) {
        var logmessage = 'Application Control Event Detected. Replaced ' + instance + ' Security Groups with Safe Security Group: ' + process.env.SafeSecurityGroup;
        console.log( logmessage );

        //Set Variables
        var params = {
            InstanceId: instance,
            Groups: [ process.env.SafeSecurityGroup ]
        };

         //Call EC2 API
        ec2.modifyInstanceAttribute( params, function( err, data ) {
            if ( err ) {
                console.log( err, err.stack );
            } else {
                var messageParams = {
                    FunctionName: process.env.FunctionName,
                    Payload: '{"message": "' + logmessage + '", "subject": "Application Control Alert for ' + instance + '"}'
                };
                
                //Send Alert Message
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
