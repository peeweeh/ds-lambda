'use strict';
var AWS = require('aws-sdk'); 
var region = 'ap-southeast-1';

console.log('Loading function');

exports.disable = (event, context, callback) => {
	console.log(event);
	console.log(event.id);
	var cloudtrail = new AWS.CloudTrail({apiVersion: '2013-11-01'});
	var eventName = event.detail.eventName;
	console.log('Details: '+eventName);
	
	if(eventName=='StopLogging')
	{

		var TrailARN = event.detail.requestParameters.name;
		console.log('ARN: '+TrailARN);
		var user = event.detail.userIdentity.arn;
		console.log('User: '+user);
		console.log('Start Logging of: '+TrailARN);
		var params = {
		  Name: TrailARN /* required */
		};
		cloudtrail.startLogging(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else     console.log(data);           // successful response
		});
	}
};
