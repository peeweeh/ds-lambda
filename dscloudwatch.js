'use strict';
var AWS = require('aws-sdk'); 
var region = 'ap-southeast-1';

console.log('Loading function');

exports.log = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    var cloudwatchlogs = new AWS.CloudWatchLogs({region:region});
    const message = event.Records[0].Sns.Message;
    
   // console.log('From SNS:', message);



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
	  // an error occurred
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
	  		logEvents: [ /* required */
	  		{
	  			message: logMessage, /* required */
	  			timestamp: timeInMs /* required */
	  		},
	  		/* more items */
	  		],
	  		logGroupName: 'ds-events', /* required */
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
