
var aws = require("aws-sdk");
aws.config.update({
  region: 'us-east-1'
})
var ses = new aws.SES({
  region: "us-east-1"
});
var docClient = new aws.DynamoDB.DocumentClient();
exports.handler = async function (event) {
  let message = event.Records[0].Sns.Message
  let json = JSON.parse(message);
  let email = json.username;
  let token = json.token;

  const seconds = 5 * 60;
  const secondsInEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsInEpoch + seconds;
  const currentTime = Math.round(Date.now() / 1000);

  //Creating a table for DynamoDB
  var table = {
    TableName: "csye6225",
    Item: {
      "username": email,
      "token": token,
      "MessageType": "Account Verification",
      "TimeToLive": expirationTime
    }
  }

  console.log("email sent " + email);
  console.log("token sent " + token);
  //Putting an item to DynamoDB Table
  docClient.put(table, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });

  console.log(email + " " + token + "Parameters set!!");
  var params = {

    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: '<html><head>' +
            '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
            '<title>' + 'Account Verification' + '</title>' +
            '</head><body>' +
            'Click on the link to verify your account. It will expire in 5 minutes.' +
            '<br><br>' +
            "<a href=\"https://prod.ketkikule.me/v1/verifyUserEmail?email=" + email + "&token=" + token + "\">" + "Verify Email" + "</a>" +
            '</body></html>',
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "CSYE 6225: Verify Email Address",
      },
    },
    Source: "no-reply@prod.ketkikule.me",
  };
  console.log("Email Send!!");

  return ses.sendEmail(params).promise()

};