'use strict';
var AWS = require('aws-sdk'); 
var region = 'ap-southeast-1';
exports.log = (event, context, callback) => {

    var cloudwatchlogs = new AWS.CloudWatchLogs({region:region});
    const message = event.Records[0].Sns.Message;
  	console.log(message);
    callback(null, message);

};
