'use strict';
var AWS = require( 'aws-sdk' );
exports.disable = ( event, context, callback ) => {
	console.log( 'Cloudwatch Disable Event' );
	// Get Variables
	var BlockARN = process.env.BlockARN;
	var iam = new AWS.IAM( );
	console.log(event);
	var cloudtrail = new AWS.CloudTrail( { apiVersion: '2013-11-01' } );
	var eventName = event.detail.eventName;
	var FunctionName = process.env.FunctionName;
	var lambda = new AWS.Lambda( { apiVersion: '2015-03-31' } );


	if ( eventName == 'StopLogging' ) {
		var TrailARN = event.detail.requestParameters.name;
		console.log( 'ARN: ' + TrailARN + 'User: ' + user );
		var user = event.detail.userIdentity.userName;
		var logmessage = 'Cloudtrail ' + TrailARN + ' was disabled by user ' + user + ', User access was revoked';
		var params = {
			Name: TrailARN /* required */
		};

		cloudtrail.startLogging( params, function( err, data ) {
			if ( err ) { console.log( err, err.stack ); } // an error occurred
			else {
				var params = {
					PolicyArn: BlockARN,
					UserName: user
				};

				console.log(logmessage);
				iam.attachUserPolicy( params, function( err, data ) {
					if ( err ) { console.log( err, err.stack ); } // an error occurred
					else {
						var messageParams = {
							FunctionName: FunctionName,
							Payload: '{"message": "' + logmessage + '", "subject": "Cloudtrail Alert for ' + TrailARN + '"}'
						};


						lambda.invoke( messageParams, function( err, data ) {
							if ( err ) console.log( err, err.stack ); // an error occurred
							else console.log( data ); // successful response
						} );
						console.log( data );
					} // successful response
				} );
				console.log( data );
			} // successful response
		} );
	}
};
