'use strict';
var AWS = require('aws-sdk'); 
var region = 'ap-southeast-1';

console.log('Loading function');

exports.log = (event, context, callback) => {

    var cloudwatchlogs = new AWS.CloudWatchLogs({region:region});
    const message = event.Records[0].Sns.Message;
    var params = {
    	logGroupName: 'ds-events', 
    	logStreamNamePrefix: 'main'
    };
    cloudwatchlogs.describeLogStreams(params, function(err, data) 
    {
    	if (err) 
    	{
    		console.log(err, err.stack); 
    	}
	
	  else 
	  {
	  	var timeInMs = Date.now();
  		console.log(timeInMs);
	  	var sequence=data.logStreams[0].uploadSequenceToken;
	  
	  	console.log(sequence);
	  	var logMessage=event.Records[0].Sns.Message;
	  	var logString=JSON.stringify(logMessage);
	  	console.log(logString);
	  	var LogParams = {
	  		logEvents: [ 
	  		{
	  			message: logMessage, 
	  			timestamp: timeInMs 
	  		},

	  		],
	  		logGroupName: 'ds-events',
	  		logStreamName: 'main',
	  		sequenceToken: sequence
	  	};
	  	cloudwatchlogs.putLogEvents(LogParams, function(err, data) 
	  	{
	  		if (err) 
	  		{

	  			console.log(err, err.stack);
	  		} 
	  		else    
	  		{
	  			console.log(data);     
	  		}      
	  	});

	  }
	});
    callback(null, message);

};
