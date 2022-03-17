const AWS = require("aws-sdk");
const crypto = require("crypto");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  var array = JSON.parse(event.body);
  var itemsArray = [];
  var resArray = [];

  for (let i = 0; i < array.length; i++) {
    var element = array[i];
    var foreign_userid = "";
    const userParam = {
        "TableName": "beacon_event_user",
        "FilterExpression": "mac = :mac",
        "ExpressionAttributeValues": {
          ":mac": element.foreign_mac
        }
    };

    try {
      const resUserInfo = await documentClient.scan(userParam).promise();
      if(resUserInfo.Count == 0){
        foreign_userid = "";
      } else {
        foreign_userid = resUserInfo.Items[0].beacon_event_user;
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

    if (element) {
      var tempArray = {
        "user_id_1": element.user_id,
        "user_mac": element.user_mac,
        "user_uuid": element.user_uuid,
        "datetime": element.datetime,
        "contact_id": generateUUID(),
        "foreign_uuid": element.foreign_uuid,
        "foreign_mac": element.foreign_mac,
        "user_id_2": foreign_userid
      };
      resArray.push(element.datetime);

      var item = {
          PutRequest: {
           Item: tempArray
          }
       };

      if (item) {
        itemsArray.push(item);
      }
    }
  }

  var params = {
    RequestItems: { 
      'closecontacts': itemsArray
    }
  };

  try {
    // Utilising the scan method to get all items in the table
    const res = await documentClient.batchWrite(params).promise()

    var resData = {
      'error': false,
      'message': 'Successfully uploaded close contacts',
      'data': resArray
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
      'data': []
    };
    return {
      statusCode: 501,
      body: JSON.stringify(errData)
    };
  }
};