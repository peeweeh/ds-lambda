'use strict';
var AWS = require( 'aws-sdk' );
var region = process.env.AWS_REGION;
exports.replace = ( event, context, callback ) => {

    var ec2 = new AWS.EC2( { region: region } );
    var autoscaling = new AWS.AutoScaling( { region: region } );

    const instance = event.instance;
    const asg = event.asg;
    const aspolicy = event.aspolicy;

    var params = {
        AutoScalingGroupName: asg,
        HonorCooldown: false,
        PolicyName: aspolicy
    };
    console.log(params);
    console.log( 'Adding more Instances ' + params);
    autoscaling.executePolicy( params, function( err, data ) {
        if ( err ) console.log( err, err.stack ); // an error occurred
        else {
            var DeleteParams = { InstanceIds: [ instance ] };

            console.log( 'Terminating Instance' );
            ec2.terminateInstances( DeleteParams, function( err, data ) {
                if ( err ) {
                    console.log( err, err.stack );
                } else {
                    console.log( data );
                }
            } );
        }

    } );

    callback( null, instance );
};
