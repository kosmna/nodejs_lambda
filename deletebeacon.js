const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  const {user_id} = JSON.parse(event.body);
  const params = {
    TableName: "beacon_event_user",
    Key: {
      beacon_event_user: user_id,
    },
  };

  try {
    // Utilising the scan method to get all items in the table
    const res = await dynamoDb.delete(params).promise();

    var resData = {
      'error': false,
      'message': 'Successfully deleted event-key info',
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