'use strict';
var AWS = require('aws-sdk');
var region = 'ap-southeast-1';

console.log('Loading function');

exports.log = (event, context, callback) => {

    var logGroupName = process.env.logGroupName;
    var logStreamName = process.env.logStreamName;
    var cloudwatchlogs = new AWS.CloudWatchLogs({ region: region });
    const message = event.Records[0].Sns.Message;
    var params = {
        logGroupName: logGroupName,
        logStreamNamePrefix: logStreamName
    };
    // Describe Log Streams
    cloudwatchlogs.describeLogStreams(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            var timeInMs = Date.now();
            console.log(timeInMs);
            var sequence = data.logStreams[0].uploadSequenceToken;
            console.log(sequence);
            var logMessage = event.Records[0].Sns.Message;
            var logString = JSON.stringify(logMessage);
            console.log(logString);
            //Get Sequence
            var LogParams = {
                logEvents: [{
                        message: logMessage,
                        timestamp: timeInMs
                    },

                ],
                logGroupName: logGroupName,
                logStreamName: logStreamName,
                sequenceToken: sequence
            };
            // Put Log Event
            cloudwatchlogs.putLogEvents(LogParams, function(err, data) {
                if (err) {

                    console.log(err, err.stack);
                } else {
                    console.log(data);
                }
            });

        }
    });
    callback(null, message);

};
