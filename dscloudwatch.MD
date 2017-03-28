#SNS to Cloudwatch Events

### Environment Variables for Lambda
+ logGroupName - Name of the Cloudwatch Logs Group Name
+ logStreamName - Name of the Cloudwatch Logs Stream Name

### How to install
+ Create a function at AWS LAMBDA 
++ Node JS ~ Blank
++ Paste the code as sent
+ Modify the lambda IAM Role to allow to write to Cloudwatch Logs (Allow writing to Cloudwatch Logs)
+ Create a SNS Topic under SNS
+ Go back to your Lambda Function Add the SNS Topic as a trigger
+ Create an IAM User
++ Grant permissions to write SNS Topic
++ Generate a an Access/Secret Key
+ At Deep Security Administration - Event forwarding
++ Enter the IAM Access/Secret Key
++ Enter the SNS TOPIC ARN (should start with arn:// )