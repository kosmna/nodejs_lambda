const AWS = require('aws-sdk');
const parser = require('lambda-multipart-parser');

// // Enter copied or downloaded access ID and secret key here
const ID = 'AKIAT2CPNXRWBMPELU4P';
const SECRET = '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';

// // The name of the bucket that you have created
const BUCKET_NAME = 'eventcheck-bucket-s3.amazonaws.com';
const BUCKET_PATH = ''

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async event => {

  const bodyParams = await parser.parse(event);
  // Read content from the file
  //const fileContent = bodyParams.files[0].content;
  var fileContent = new Buffer(bodyParams.files[0].content, 'base64');

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    ACL: 'public-read',
    Key: bodyParams.files[0].filename, // File name you want to save as in S3
    Body: fileContent,
    ContentType: bodyParams.files[0].contentType
  };

  const putObjectWrapper = (params) => {
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, result) {
        if(err) resolve(err);
        if(result) resolve(result);
      });
    })
  }
  // Uploading files to the bucket
  try {
    const s3res = await putObjectWrapper(params);
    var image_path = s3res.Location;

    if(bodyParams.email){
      const chkparams = {
          "TableName": "users",
          "FilterExpression": "user_name = :email",
          "ExpressionAttributeValues": {
            ":email": bodyParams.email
          }
      };
      const res = await documentClient.scan(chkparams).promise();

      if(res.Count == 0){
        var retData = {
          'error': false,
          'message': 'File uploaded successfully',
          'data': {
            'result': true,
            'image_path': image_path
          }
        };
        return {
          statusCode: 200,
          body: JSON.stringify(retData)
        };
      } else {
        const updateParams = {
          "TableName": "users",
          "Key": {
            "user_name": bodyParams.email,
          },
          "ExpressionAttributeValues": {
            ':profile': image_path
          },
          "UpdateExpression": "SET profile = :profile",
          "ReturnValues": 'ALL_NEW',
        };

        const res = await documentClient.update(updateParams).promise();

        var retData = {
          'error': false,
          'message': 'Successfully updated profile info',
          'data': {
            'result': true,
            'image_path': image_path
          }
        };
        return {
          statusCode: 200,
          body: JSON.stringify(retData)
        };
      }
    } else {
      var retData = {
        'error': false,
        'message': 'File uploaded successfully',
        'data': {
          'result': true,
          'image_path': s3res.Location
        }
      };
      return {
        statusCode: 200,
        body: JSON.stringify(retData)
      };
    }
  } catch (e) {
    var errData = {
      'error': true,
      'message': 'Occured an error',
      'data': {
        result: false
      }
    };
    return {
      statusCode: 501,
      body: JSON.stringify(errData)
    };
  }
};