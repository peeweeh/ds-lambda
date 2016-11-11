'use strict';
var AWS = require('aws-sdk'); 
var region = 'ap-southeast-1';

console.log('Loading function');

exports.isolate = (event, context, callback) => {

    var ec2 = new AWS.EC2({region:region});
    const message = event.Records[0].Sns.Message;
    var jsonContent = JSON.parse(message);
    var instance = jsonContent.HostInstanceID;
 
    console.log('Event Type: '+jsonContent.EventType+' Instance ID: '+instance); 
    //if(false)
    if(jsonContent.EventType=='PayloadLog' && jsonContent.ActionString=="Reset" && jsonContent.HostSecurityPolicyName=="Apache/PHP/BCJC" && jsonContent.SeverityString=="High")
    {
        var describeParams = { InstanceId:instance, Attribute: "blockDeviceMapping"};
        ec2.describeInstanceAttribute(describeParams, function(err, data) 
        {
           if (err) 
          {
              console.log(err, err.stack); 
          }
          else  
          {
              console.log(data);
              var volumeId = data.BlockDeviceMappings[0].Ebs.VolumeId;
              console.log('Backing Up: '+volumeId); 
              var BackupParams = {
                 Description: 'Backup for Investigation: '+volumeId+' Instance: '+instance, 
                 VolumeId: volumeId
             };
             ec2.createSnapshot(BackupParams, function(err, data) {
                 if (err) 
                 {
                    console.log(err, err.stack);
                }
                else   
                {
                    console.log(data); 
                    var DeleteParams = {InstanceIds: [ instance ]};
                    ec2.terminateInstances(DeleteParams, function(err, data) {
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
         }      
     });
    }
    else
    {
        console.log('No Malware, Nothing to do');
    }
    callback(null, message);

};
