const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const { uuid } = JSON.parse(event.body);
  try {
    var issuer_name = "";
    var idtype_name = "";
    var team_name = "";
    var unit_name = "";
    var id_bkg_color = "";
    var id_txt_color = "";
    if(uuid){
      var issuer_code = uuid.substr(2, 4);
      var idtype_code = uuid.substr(8, 4);
      var team_code = uuid.substr(20, 8);
      var unit_code = uuid.substr(28, 4);
      var issuerParam = {
          "TableName": "issuers",
          "FilterExpression": "issuer_code = :issuerCode",
          "ExpressionAttributeValues": {
            ":issuerCode": issuer_code
          }
      };
      const issuerRes = await documentClient.scan(issuerParam).promise();
      if(issuerRes.Count != 0){
        issuer_name = issuerRes.Items[0].issuer_full_name;
      }
      var idtypeParam = {
          "TableName": "id_types",
          "FilterExpression": "idtype_code = :idtypeCode",
          "ExpressionAttributeValues": {
            ":idtypeCode": idtype_code
          }
      };
      const idtypeRes = await documentClient.scan(idtypeParam).promise();
      if(idtypeRes.Count != 0){
        idtype_name = idtypeRes.Items[0].idtype_name;
        id_bkg_color = idtypeRes.Items[0].bkd_color;
        id_txt_color = idtypeRes.Items[0].text_color;
      }
      var teamParam = {
          "TableName": "teams",
          "FilterExpression": "team_code = :teamCode AND unit_code = :unitCode",
          "ExpressionAttributeValues": {
            ":teamCode": team_code,
            ":unitCode": unit_code
          }
      };
      const teamRes = await documentClient.scan(teamParam).promise();
      if(teamRes.Count != 0){
        team_name = teamRes.Items[0].team_name;
        unit_name = teamRes.Items[0].unit_name;
      }
    } else {
      return {
        statusCode: 501,
        body: JSON.stringify({
          'error': true,
          'message': 'UUID is empty.',
          'data': []
        })
      };
    }
    eventKeyData = {
      "issuer": issuer_name,
      "idtype": idtype_name,
      "id_bkg_color": id_bkg_color,
      "id_txt_color": id_txt_color,
      "team": team_name,
      "unit": unit_name
    };
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        'error': false,
        'message': "Event Key data.",
        'data': eventKeyData
      })
    };
    return response; // Returning a 200 if the item has been inserted
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
