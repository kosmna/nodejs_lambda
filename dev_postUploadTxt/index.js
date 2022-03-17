const AWS = require('aws-sdk');
const parser = require('lambda-multipart-parser');

// // Enter copied or downloaded access ID and secret key here
const ID = 'AKIAT2CPNXRWOO3RPTGD';
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