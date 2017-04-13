'use strict';
var AWS = require( 'aws-sdk' );
exports.check = ( event, context, callback ) => {
	var FunctionName = process.env.FunctionName;
	var envconfigRuleName = process.env.configRuleName;
	const message = event.Records[ 0 ].Sns;
	var jsonContent = JSON.parse( message.Message );
	var messageType = jsonContent.messageType;
	console.log( jsonContent );

	if ( messageType == "ComplianceChangeNotification" ) {

		var resourceId = jsonContent.resourceId;
		var complianceType = jsonContent.newEvaluationResult.complianceType;
		var configRuleName = jsonContent.configRuleName;
		console.log( complianceType + " " + configRuleName );
		var region = process.env.AWS_REGION;
		var ec2 = new AWS.EC2( {
			region: region
		} );
		var lambda = new AWS.Lambda( {
			apiVersion: '2015-03-31'
		} );
		var messageParams = {
			FunctionName: FunctionName,
			Payload: '{"message": "We have detected a SSH Violation for the following Security Group: ' + resourceId + ' ' + complianceType + ' ' + configRuleName + '", "subject": "Config Rules Event ' + configRuleName + '"}'
		};
		if ( complianceType == 'NON_COMPLIANT' && configRuleName == envconfigRuleName ) {
			console.log( 'Non Compliance Detected, will remove ingress from Security Group: ' + resourceId);
			var params = {
				CidrIp: '0.0.0.0/0',
				FromPort: 22,
				GroupId: resourceId,
				IpProtocol: "TCP",
				ToPort: 22
			};
			ec2.revokeSecurityGroupIngress( params, function( err, data ) {
				if ( err ) {
					console.log( err, err.stack );
				} // an error occurred
				else {
					lambda.invoke( messageParams, function( err, data ) {
						if ( err ) console.log( err, err.stack ); // an error occurred
						else console.log( data ); // successful response
					} );
					console.log( data );
				} // successful response
			} );
		}

	} else {

		context.done( null, "Does not Meet Parameters" );

	}

	callback( null, "Done" );
};
