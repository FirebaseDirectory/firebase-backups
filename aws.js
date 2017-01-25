const fs = require('fs');
const AWS = require('aws-sdk');
const deferred = require('deferred');

var getAwsParams = function(){  
  var AWS = {};
  if (process.env.hasOwnProperty("FBR_S3_BUCKET")) { 
    AWS.FBR_S3_BUCKET = process.env.FBR_S3_BUCKET;
  } else {
    console.log("Bucket Not Configured in Environment.");
    AWS.FBR_S3_BUCKET = null;
  }
  if (process.env.hasOwnProperty("FBR_ACCESS_KEY_ID")) { 
    AWS.FBR_ACCESS_KEY_ID = process.env.FBR_ACCESS_KEY_ID;
  } else {
    console.log("Access Key Not Configured in Environment.");
    AWS.FBR_ACCESS_KEY_ID = null;
  }
  if (process.env.hasOwnProperty("FBR_SECRET_ACCESS_KEY")) { 
    AWS.FBR_SECRET_ACCESS_KEY = process.env.FBR_SECRET_ACCESS_KEY;
  } else {
    console.log("Access Secret Not Configured in Environment.");
    AWS.FBR_SECRET_ACCESS_KEY = null;
  }
  if (process.env.hasOwnProperty("FBR_REGION")) { 
    AWS.FBR_REGION = process.env.FBR_REGION;
  } else {
    console.log("Region Not Configured in Environment.");
    AWS.FBR_REGION = null;
  }
  return AWS;
};

exports.uploadS3 = function (filepath, bucketLocation) {
  var def = deferred();
  var s3KeyName = bucketLocation+"/"+filepath.split('/').pop();
  var AWSData = getAwsParams();
  var s3 = new AWS.S3({params: {Bucket: AWSData.FBR_S3_BUCKET},accessKeyId: AWSData.FBR_ACCESS_KEY_ID, secretAccessKey: AWSData.FBR_SECRET_ACCESS_KEY});
  AWS.config.region = AWSData.FBR_REGION;
  fs.readFile(filepath, function (err, filedata) {
    if(err) {
      def.reject('unable to read file to upload to s3');
    } else {
      var data = {
        Bucket: AWSData.FBR_S3_BUCKET,
        Key: s3KeyName,
        Body: filedata
      };
      var result;
      s3.putObject(data, function (err, data) {
        if (err) {
          result = {
            msg: `Error uploading data: ${bucketLocation}`
          };
          def.reject(result);
        } else {
          result = {
            msg: `Backup saved to s3 drive : ${AWSData.FBR_S3_BUCKET}/${s3KeyName}`,
            url: `https://s3.amazonaws.com/${AWSData.FBR_S3_BUCKET}/${s3KeyName}`,
            key: s3KeyName
          };
          console.log( result.msg );
          def.resolve(result);
        }
      });
    }
  });

  return def.promise;
}