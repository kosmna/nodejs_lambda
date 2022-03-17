const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const params = {
    TableName: "ranging_variables" // The name of your DynamoDB table
  };
  try {
    // Utilising the scan method to get all items in the table
    const data = await documentClient.scan(params).promise();

    var resData = {
      'error': false,
      'message': 'Ranging Variables',
      'data': data.Items
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