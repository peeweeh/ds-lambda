'use strict';
var AWS = require('aws-sdk');
exports.ac = (event, context, callback) => {
    console.log('Deep Security App Control Demo');
    //Parse Message
    const message = event.Records[0].Sns.Message;
    var jsonContent = JSON.parse(message);
    //Get Instance ID
    var instance = jsonContent[0].HostInstanceID;
    // Set Environment Variables
    var region = process.env.AWS_REGION;
    var EventType = process.env.EventType;
    var OperationDesc = process.env.OperationDesc;
    var Action = process.env.Action;
    var FunctionName = process.env.FunctionName;
    var SafeSecurityGroup = process.env.SafeSecurityGroup;
    var HostSecurityPolicyName = process.env.HostSecurityPolicyName;
    //Instantiate EC2
    var ec2 = new AWS.EC2({ region: region });
    var lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });
    //Check if it passes All Conditions
    if (jsonContent[0].HostSecurityPolicyName == HostSecurityPolicyName && jsonContent[0].Action == Action && jsonContent[0].OperationDesc == OperationDesc) {
        var logmessage = 'Application Control Event Detected. Replaced ' + instance + ' Security Groups with Safe Security Group: ' + SafeSecurityGroup;
        console.log(logmessage);
        var params = {
            InstanceId: instance,
            Groups: [SafeSecurityGroup]
        };
        ec2.modifyInstanceAttribute(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                var messageParams = {
                    FunctionName: FunctionName,
                    Payload: '{"message": "' + logmessage + '", "subject": "Application Control Alert for ' + instance + '"}'
                };
                lambda.invoke(messageParams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data); // successful response
                });
                console.log(data);
            }
        });
    } else {
        //Not Passed
    }
    callback(null, message);
};
