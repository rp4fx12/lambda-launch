const AWS = require('aws-sdk');


const awsRegion = 'us-east-1';
AWS.config.update({region: awsRegion});
const autoScaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});

const updateAutoScaleTagsParams = {
	Tags: [
    {
      Key: 'Name', 
      Value: 'simple-ec2-blue'
    },
}

const cloudEventParams = {
 	Name: 'Trigger Lambda after 20 minutes',
 	Description: 'Triggers Lambda after 20 minutes if instance is not healthy',
 	ScheduleExpression: 'rate(20 minutes)',
 	State: 'DISABLED'
 }

udpateTags = function() {
	return new Promise(function (reject, resolve) {
		autoScaling.createOrUpdateTags(function (err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	})
};


udpateTags();
