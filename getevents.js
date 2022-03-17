const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const params = {
    TableName: "events" // The name of your DynamoDB table
  };
  try {
    // Utilising the scan method to get all items in the table
    const data = await documentClient.scan(params).promise();
    const timenow = new Date().getTime();

    var events = [];
    for (var i = 0; i < data.Items.length; i++) {
      if(timenow > data.Items[i].end_datetime)
        continue;
      var event = {
        event_id: data.Items[i].event_id,
        primary_organizer: data.Items[i].secondary_organizer_1_short_name,
        event_name: data.Items[i].event_name,
        start_datetime: data.Items[i].start_datetime,
        end_datetime: data.Items[i].end_datetime,
        venue_short_name: data.Items[i].venue_short_name
      };
      events.push(event);
    };

    var resData = {
      'error': false,
      'message': 'Event list',
      'data': events
    };
    const response = {
      statusCode: 200,
      body: JSON.stringify(resData)
    };
   console.info("daves EVENT\n" + JSON.stringify(event, null, 2))
    return response;
  } catch (e) {
    var errData = {
      'error': true,
      'message': 'Occured error',
      'data': []
    };
    return {
      statusCode: 501,
      body: JSON.stringify(errData)
    };
  }
};