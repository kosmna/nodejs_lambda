const AWS = require("aws-sdk");
const crypto = require("crypto");
const md5 = require('md5');

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();
const timestamp = new Date().getTime();

exports.handler = async event => {
  const { first_name, last_name, email, password } = JSON.parse(event.body);
  var passwd = md5(password);
  const chkparams = {
      "TableName": "users",
      "FilterExpression": "user_name = :email",
      "ExpressionAttributeValues": {
        ":email": email
      }
  };

  const params = {
    TableName: "users", // The name of your DynamoDB table
    Item: { // Creating an Item with a unique id and with the passed title
      user_id: generateUUID(),
      first_name: first_name,
      last_name: last_name,
      user_name: email,
      password: passwd,
      profile: "",
      datetimecreated: timestamp
    }
  };
  try {
    const res = await documentClient.scan(chkparams).promise();
    if(res.Count == 0){
      const data = await documentClient.put(params).promise();
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          'error': false,
          'message': "Successfully created new user",
          'data': {
            user_id: params.Item.user_id, email: params.Item.user_name, first_name: params.Item.first_name, last_name: params.Item.last_name, profile: "" }
        })
      };
      return response; // Returning a 200 if the item has been inserted 
    } else {
      var resData = {
        'error': true,
        'message': 'Please choose another user name',
        'data': []
      };

      const response = {
        statusCode: 501,
        body: JSON.stringify(resData)
      };
      return response;
    }
  } catch (e) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        'error': true,
        'message': 'Occured an error',
        'data': []
      })
    };
  }
};