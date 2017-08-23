const AWS = require('aws-sdk');


const awsRegion = 'us-east-1';
AWS.config.update({region: awsRegion});

const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
const elb = new AWS.ELB({apiVersion: '2012-06-01'});
const autoScaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});

const launchName = 'simple-launch-configuration';
const elbName = 'simple-elb';

 encodeUserData = function(userDataStr) {
 	return new Buffer(userDataStr).toString('base64');
 };

 const userDataStr = `#!/bin/bash
 			echo 'test'
 			sudo yum update -y
 			sudo yum install git -y
 			mkdir /app
            chmod 755 /app
            cd /app
            git clone https://github.com/rp4fx12/hello-world.git
            curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash -
            sudo yum install nodejs --enablerepo=nodesource -y
            node --version > nodeVersion.txt
            cd /app/hello-world
            npm install
            npm start
`


const elbParams =  {
  Listeners: [
     {
    InstancePort: 3000, 
    InstanceProtocol: 'HTTP', 
    LoadBalancerPort: 80, 
    Protocol: 'HTTP'
   }
  ], 
  LoadBalancerName: elbName,
  SecurityGroups: [
  	'sg-ae5a19d4'
  ],
  Subnets: [
  	'subnet-e29f62cf',
  	'subnet-7470dd3d'
  ],
  Tags: [
  	{
  		Key: 'State',
  		Value: 'Green'
  	}
  ]
 };

 const healthCheckParams = {
 	HealthCheck: {
 		HealthyThreshold: 2,
 		Interval: 30,
 		Target: 'HTTP:3000/',
 		Timeout: 5,
 		UnhealthyThreshold: 2
 	},
 	LoadBalancerName: elbName
 };

 // const cloudAlarmParams = {
 // 	AlarmName: 'Cloud-Green-Test',
 // 	ComparisonOperator: GreaterThanOrEqualToThreshold,
 // 	EvaluationPeriods: 20,
 // 	MetricName: 'HealthyHostCount',
 // 	NameSpace: 'AWS/ELB',
 // 	Period: 30,
 // 	Threshold: 1.0,
 // 	ActionsEnabled: true,
 // 	OKActions: [

 // 	]
 // }

 // const cloudEventParams = {
 // 	Name: 'Trigger Lambda after 20 minutes',
 // 	Description: 'Triggers Lambda after 20 minutes if instance is not healthy',
 // 	ScheduleExpression: 'rate(20 minutes)',
 // 	State: 'ENABLED'
 // }

 const launchParams = {
 	LaunchConfigurationName: launchName,
 	IamInstanceProfile: 'EC2Access',
 	ImageId: 'ami-a4c7edb2',
 	InstanceType: 't2.micro',
 	 SecurityGroups: [
    	'sg-ae5a19d4'
  	],
  	KeyName: 'HelloWorld',
  	UserData: encodeUserData(userDataStr)
 };

 const autoScaleParams = {
 	AutoScalingGroupName: 'simple-auto-scaling',
 	AvailabilityZones: [
     'us-east-1a',
     'us-east-1b',
  	], 
  	HealthCheckGracePeriod: 100,
  	HealthCheckType: 'EC2',
  	LaunchConfigurationName: launchName,
  	MaxSize: 1,
  	MinSize: 1,
  	LoadBalancerNames: [
  		elbName
  	],
  	Tags: [
    {
      Key: 'Name', 
      Value: 'simple-ec2-green'
    },
  ]
 }

createELB = function() {
	return new Promise(function (resolve, reject) {
		elb.createLoadBalancer(elbParams, function(err, data) {
			if (err) return reject(err);
			else return resolve(data);
		});
	});	
};

addHealthCheck = function() {
	return new Promise(function (resolve, reject) {
		elb.configureHealthCheck(healthCheckParams, function(err, data) {
			if (err) return reject(err);
			else return resolve(data);
		});
	});	
};

createLaunchConf = function() {
	return new Promise(function (resolve, reject) {
		autoScaling.createLaunchConfiguration(launchParams, function(err, data) {
			if (err) return reject(err);
			else return resolve(data);
		});
	});
};

createAutoScalingGroup = function() {
	return new Promise(function (resolve, reject) {
		autoScaling.createAutoScalingGroup(autoScaleParams, function(err, data) {
			if (err) return reject(err);
			else return resolve(data);
		});
	});
};



// const elbLaunchConfPromise = Promise.all([createELB(), createLaunchConf()]);
// elbLaunchConfPromise.then(addHealthCheck)
// .then( function (data) {
// 	createAutoScalingGroup().then( function(data){
// 		console.log(data);
// 	}, function(err) {
// 		console.log(err);
// 	})
// }, function (err) {
//  	console.log(err);
// });

createAutoScalingGroup();

