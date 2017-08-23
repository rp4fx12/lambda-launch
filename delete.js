const Promise = require("bluebird");

const AWS = require('aws-sdk');
const awsRegion = 'us-east-1';
AWS.config.update({region: awsRegion});

const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
Promise.promisifyAll(Object.getPrototypeOf(ec2));
const elb = new AWS.ELB({apiVersion: '2012-06-01'});
Promise.promisifyAll(Object.getPrototypeOf(elb));
const autoScaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});
Promise.promisifyAll(Object.getPrototypeOf(autoScaling));


const elbParams = {
	LoadBalancerName:'simple-elb'
};

const launchParams = {
	LaunchConfigurationName: 'simple-launch-configuration'
};

const autoScaleParams = {
	AutoScalingGroupName: 'simple-auto-scaling',
	ForceDelete: true
};

deleteELB = function() {
	return new Promise(function (resolve, reject) {
		elb.deleteLoadBalancer(elbParams, function(err, data){
			if (err) console.log(err, err.stack);
			else console.log(JSON.stringify(data));
		});
	});
};

deleteLaunchConfig = function() {
	return new Promise(function (resolve, reject) {
		autoScaling.deleteLaunchConfiguration(launchParams, function(err, data) {
			if (err) console.log(err, err.stack);
			else console.log(JSON.stringify(data));
		});
	});
}

deleteAutoScaling = function() {
	return new Promise(function (resolve, reject) {
		autoScaling.deleteAutoScalingGroup(autoScaleParams, function(err, data) {
			if (err) console.log(err, err.stack);
			else console.log(JSON.stringify(data));
		});
	});
};


var elbAutoDelete = Promise.all([deleteELB(), deleteAutoScaling()]);
elbAutoDelete.then(deleteLaunchConfig());

//deleteAutoScaling();
//deleteLaunchConfig();



