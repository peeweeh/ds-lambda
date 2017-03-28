'use strict';
var AWS = require('aws-sdk');
exports.am = (event, context, callback) => {
    console.log('Deep Security SNS AM Demo');
    const message = event.Records[0].Sns.Message;
    var jsonContent = JSON.parse(message);
    var instance = jsonContent[0].HostInstanceID;
    var region = process.env.AWS_REGION;
    var EventType = process.env.EventType;
    var MajorVirusTypeString = process.env.MajorVirusTypeString;
    var HostSecurityPolicyName = process.env.HostSecurityPolicyName;
    var ec2 = new AWS.EC2({ region: region });
    var ContentMalware = jsonContent[0].MalwareName
    var FunctionName = process.env.FunctionName;
    var lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });
    console.log(jsonContent[0]);
    console.log('Instance ID: ' + instance);
    if (jsonContent[0].HostSecurityPolicyName == HostSecurityPolicyName && jsonContent[0].EventType == EventType && jsonContent[0].MajorVirusTypeString == MajorVirusTypeString) {
        var logmessage = 'Suspicious Object Detected for Instance ' + instance + '. Will terminate and replace the instance';
        console.log('Log Message');
        //Get EBS Volume
        var describeParams = { InstanceId: instance, Attribute: "blockDeviceMapping" };
        ec2.describeInstanceAttribute(describeParams, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
                var volumeId = data.BlockDeviceMappings[0].Ebs.VolumeId;
                console.log('Backing Up: ' + volumeId);
                var BackupParams = {
                    Description: 'Backup for Investigation: ' + volumeId + ' Instance: ' + instance,
                    VolumeId: volumeId
                };
                //Create Snapshot of Volume
                ec2.createSnapshot(BackupParams, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        console.log(data);
                        var DeleteParams = { InstanceIds: [instance] };
                        //Terminate the Instance
                        ec2.terminateInstances(DeleteParams, function(err, data) {
                            if (err) {
                                console.log(err, err.stack);
                            } else {
                                var messageParams = {
                                    FunctionName: FunctionName,
                                    Payload: '{"message": "' + logmessage + '", "subject": "Suspicious Object Alert for ' + instance + '"}'
                                };
                                lambda.invoke(messageParams, function(err, data) {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else console.log(data); // successful response
                                });
                                console.log(data);
                            }
                        });
                    }
                });
            }
        });
    } else {
        console.log('Event did not hit the Specific Requirements');
    }
    callback(null, message);
};
