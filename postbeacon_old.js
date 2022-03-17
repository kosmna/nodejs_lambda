const AWS = require("aws-sdk");
const crypto = require("crypto");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const {uuid, major_number, minor_number, member_number, team_name, issuer_short_name, unit_name, idtype_name, bkd_color, text_color,
         year_issued, disable_intrateam_alarm, disable_interteam_alarm, datetimecreated } = JSON.parse(event.body);
  const params = {
    TableName: "beacons", // The name of your DynamoDB table
    Item: { // Creating an Item with a unique id and with the passed title
      beacon_id: generateUUID(),
      uuid: uuid,
      major_number: major_number,
      minor_number: minor_number,
      member_number : member_number,
      team_name: team_name,
      issuer_short_name: issuer_short_name,
      unit_name: unit_name,
      idtype_name: idtype_name,
      bkd_color: bkd_color,
      text_color: text_color,
      year_issued: year_issued,
      disable_intrateam_alarm: disable_interteam_alarm,
      datetimecreated: datetimecreated
    }
  };
  try {
    // Utilising the put method to insert an item into the table (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
    const data = await documentClient.put(params).promise();
    const response = {
      statusCode: 200
    };
    return response; // Returning a 200 if the item has been inserted 
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    };
  }
};