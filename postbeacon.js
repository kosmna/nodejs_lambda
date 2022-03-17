const AWS = require("aws-sdk");
const crypto = require("crypto");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  const {uuid, userId, eventId, mac, major, minor} = JSON.parse(event.body);

  var params = {
    Item: {
      beacon_event_user: userId,
      uuid: uuid,
      event_id: eventId,
      id: generateUUID(),
      major: major,
      minor: minor,
      mac: mac
    },
    TableName: "beacon_event_user",
    ReturnValues: "ALL_OLD"
  };
  try {
    // Utilising the scan method to get all items in the table
    const res = await documentClient.put(params).promise()

    var resData = {
      'error': false,
      'message': 'Successfully uploaded event-key info',
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