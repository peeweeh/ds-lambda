'use strict';
var AWS = require('aws-sdk');
exports.sns = (event, context, callback) => {
    var region = process.env.AWS_REGION;
    var sns = new AWS.SNS();
    const message = event.message;
    const subject = event.subject;
    console.log(message);
    console.log(subject);
    //Set Environment Variables
    var TopicArn = process.env.TopicArn;
    var SNSparams = {
        Message: message,
        Subject: subject,
        TopicArn: TopicArn
    };
    sns.publish(SNSparams, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });
    callback(null,TopicArn);
};
