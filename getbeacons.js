const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  if(!event.queryStringParameters.email ||
      !event.queryStringParameters.mac){
      var resData = {
        'error': true,
        'message': 'Please fill all mandatory fields',
        'data': {
          result: false
        }
      };
      const response = {
        statusCode: 501,
        body: JSON.stringify(resData)
      };
      callback(null, response);
      return;
  }

  const params = {
      "TableName": "beacon_event_user",
      "FilterExpression": "beacon_event_user = :beacon_event_user AND mac = :mac",
      "ExpressionAttributeValues": {
        ":beacon_event_user": event.queryStringParameters.email,
        ':mac': event.queryStringParameters.mac
      }
  };
  try {
    // Utilising the scan method to get all items in the table
    const res = await documentClient.scan(params).promise();
    if(res.Count == 0){
      var resData = {
        'error': false,
        'message': 'Beacon is not used',
        'data': {
          result: false
        }
      };
    } else {
      var event_name = "";
      var username = "";
      if(res.Items[0].event_id){
        const eventParams = {
            "TableName": "events",
            "FilterExpression": "event_id = :eventId",
            "ExpressionAttributeValues": {
              ":eventId": res.Items[0].event_id
            }
        };
      }
      const eventInfo = await documentClient.scan(eventParams).promise();
      if(eventInfo.Count != 0)
        event_name = eventInfo.Items[0].event_name;

      const userParams = {
          "TableName": "users",
          "FilterExpression": "user_name = :email",
          "ExpressionAttributeValues": {
            ":email": event.queryStringParameters.email
          }
      };
      const userInfo = await documentClient.scan(userParams).promise();
      if(userInfo.Count != 0){
        username = userInfo.Items[0].first_name + " " + userInfo.Items[0].last_name;
      }

      var resData = {
        'error': false,
        'message': 'Beacon is used',
        'data': {
          result: true,
          user: username,
          event: event_name
        }
      };
    }
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