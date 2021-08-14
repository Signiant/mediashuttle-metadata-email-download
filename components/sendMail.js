require('dotenv').config()

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const config = require('../config');
const ses = new SESClient({
    region: config.settings.AWS_REGION,
    accessKeyId: process.env.X_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.X_AWS_SECRET_ACCESS_KEY
    });

const setEmailParams = (emailParams) => {
    
    let {to, from, subject, emailBody} = emailParams
    
    // Check for less than 50 or less support recipients
    if (to.length >= 50) {
        console.log('More than 50 recipients is not allowed.')
        return { error: 'More than 50 recipients is not allowed.'}
    }
    // Set the parameters
    const params = {
        Destination: {
            BccAddresses: to
        },
        Message: {
            /* required */
            Body: {
                /* required */
                // Html: {
                //     Charset: "UTF-8",
                //     Data: "HTML_FORMAT_BODY",
                // },
                Text: {
                    Charset: "UTF-8",
                    Data: emailBody
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: from
        // ReplyToAddresses: [
        //     /* more items */
        // ],
    };
    return params
}

module.exports.sendMail = async (emailData) => {

    let params = setEmailParams(emailData)
    
    try {
        const result = await ses.send(new SendEmailCommand(params));
        return { result }
    } catch (error) {
        return { error }
    }
}