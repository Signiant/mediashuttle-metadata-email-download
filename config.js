require('dotenv').config()

module.exports.settings = {
    apiUrl: "https://api.mediashuttle.com/v1",
    AWS_REGION: "us-west-2"
}

module.exports.keys = {
    MS_API_KEY: process.env.MS_API_KEY
}

module.exports.portalMapping = [
    {
        name: "Gingo One",
        uploadUrl: "gingo-one-upload.mediashuttle.com",
        downloadUrl: "gingo-one-download.mediashuttle.com",
        expirationHours: 168,
        senderEmail: "sreynolds@signiant.com",
        emailSubject: "Gingo One has new package available to download",
        emailBody: "Click below to download the package:",
        applicationHost: "https://yzzbcwhs06.execute-api.us-west-2.amazonaws.com/dev",
        registrationKey: "548dee83-3be1-4afa-ba54-0fc54cfa936b"
    }
]