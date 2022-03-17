const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const md5 = require('md5');

exports.handler = async event => {

  const { email, password } = JSON.parse(event.body);
  var passwd = md5(password);

  const chkparams = {
      "TableName": "users",
      "FilterExpression": "user_name = :email AND password = :password",
      "ExpressionAttributeValues": {
        ":email": email,
        ":password": passwd
      }
  };

  try {
    const res = await documentClient.scan(chkparams).promise();
    if(res.Count == 0){
      var resData = {
        'error': true,
        'message': 'Login failed',
        'data': null
      };
      const response = {
        statusCode: 501,
        body: JSON.stringify(resData)
      };
      return response;
    } else {
      var userData = {
       "id": res.Items[0].user_id,
       "first_name": res.Items[0].first_name,
       "last_name": res.Items[0].last_name,
       "email": res.Items[0].user_name,
       "profile": res.Items[0].profile
      };
      var eventKeyParam = {
          "TableName": "beacon_event_user",
          "FilterExpression": "beacon_event_user = :email",
          "ExpressionAttributeValues": {
            ":email": email
          }
      };
      const eventKeyRes = await documentClient.scan(eventKeyParam).promise();
      var eventKeyData = null;
      var eventData = null;
      if(eventKeyRes.Count != 0){
        var uuid = eventKeyRes.Items[0].uuid;
        var event_id = eventKeyRes.Items[0].event_id;
        var issuer_name = "";
        var idtype_name = "";
        var team_name = "";
        var unit_name = "";
        var id_bkg_color = "";
        var id_txt_color = "";
        if(event_id){
          var eventParam = {
              "TableName": "events",
              "FilterExpression": "event_id = :eventId",
              "ExpressionAttributeValues": {
                ":eventId": event_id
              }
          };
          const eventRes = await documentClient.scan(eventParam).promise();
          if(eventRes.Count != 0){
            eventData = {
              "event_id": event_id,
              "primary_organizer": eventRes.Items[0].secondary_organizer_1_short_name,
              "event_name": eventRes.Items[0].event_name,
              "start_datetime": eventRes.Items[0].start_datetime,
              "end_datetime": eventRes.Items[0].end_datetime
            }
          }
        }

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
        }

        eventKeyData = {
          "mac": eventKeyRes.Items[0].mac,
          "uuid": uuid,
          "issuer": issuer_name,
          "idtype": idtype_name,
          "id_bkg_color": id_bkg_color,
          "id_txt_color": id_txt_color,
          "team": team_name,
          "unit": unit_name,
          "major": eventKeyRes.Items[0].major,
          "minor": eventKeyRes.Items[0].minor
        };
      }

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          'error': false,
          'message': "Logged user detail",
          'data': {
            "user" : userData,
            "event": eventData,
            "Key" : eventKeyData
          }
        })
      };
      return response; // Returning a 200 if the item has been inserted 
    }
  } catch (e) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        'error': true,
        'message': 'Occured an error',
        'data': null
      })
    };
  }
};
