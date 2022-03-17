const AWS = require("aws-sdk");
// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();
const md5 = require('md5');

exports.handler = async event => {
  const bodyParam = JSON.parse(event.body);
  var first_name = "";
  var last_name = "";
  var password = "";
  var email = bodyParam.email;
  var ExpressionAttributeValues = [];
  var UpdateExpression = "";

  if(bodyParam.first_name){
    first_name = bodyParam.first_name;
    ExpressionAttributeValues = {
      ':first_name': first_name
    }
    UpdateExpression = "first_name = :first_name";
  }

  if(bodyParam.last_name){
    last_name = bodyParam.last_name;
    if(UpdateExpression != ""){
      UpdateExpression += ", last_name = :last_name";
      ExpressionAttributeValues = {
        ':first_name': first_name,
        ':last_name': last_name
      }
    } else{
      UpdateExpression = "last_name = :last_name";
      ExpressionAttributeValues = {
        ':last_name': last_name
      }
    }
  }

  if(bodyParam.password){
    password = md5(bodyParam.password);
    if(UpdateExpression != ""){
      UpdateExpression += ", password = :password";
      if(bodyParam.last_name && bodyParam.first_name){
        ExpressionAttributeValues = {
          ':first_name': first_name,
          ':last_name': last_name,
          ':password': password
        }
      } else if (bodyParam.last_name){
        ExpressionAttributeValues = {
          ':last_name': last_name,
          ':password': password
        }
      } else {
        ExpressionAttributeValues = {
          ':first_name': first_name,
          ':password': password
        }
      }
    } else {
      UpdateExpression = "password = :password";
      ExpressionAttributeValues = {
        ':password': password
      }
    }
  }

  if(UpdateExpression == ""){
    var errData = {
      'error': true,
      'message': 'Please fill mandatory field.',
      'data': {
        result: false
      }
    };
    return {
      statusCode: 403,
      body: JSON.stringify(errData)
    };
  }

  const params = {
    "TableName": "users",
    "Key": {
      "user_name": email,
    },
    "ExpressionAttributeValues": ExpressionAttributeValues,
    "UpdateExpression": "SET " + UpdateExpression,
    "ReturnValues": 'ALL_NEW',
  };

  try {
    // Utilising the scan method to get all items in the table
    const res = await documentClient.update(params).promise();

    var resData = {
      'error': false,
      'message': 'Successfully updated profile info',
      'data': {
        result: true
      }
    };
    const response = {
      statusCode: 200,
      body: JSON.stringify(resData)
    };
    return response;
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