/*
Module workflow:
    1. Receive webhook from mediashuttle.com when file upload completes
    2. Determines associated download portal and retrieves member emails
    3. Generates an upload link that will hit the POST /request endpoint
    4. Sends email to receipients with the link
*/

const { sendMail } = require('../../../components/sendMail')
const { portalMapping } = require('../../../config')
const getPortals = require("../../../components/getPortals.js")
const getPackages = require("../../../components/getPackages.js")
const getMembersFromPortal = require("../../../components/getMembersFromPortal")

module.exports.webhookController = async (req, res) => {
    
    console.log('webhookController req.body:', req.body)
    // retrieve webhook payload details
    const { payload } = req.body
    console.log('webhookController payload', payload)
    
    // lookup portal mapping to determine download portal
    const mapping = portalMapping.find(item => {
        if (payload.portalDetails.url === item.uploadUrl) {
            return item
        }
    })
  
    const portalInfo = await getPortals(mapping.downloadUrl)
    const downloadPortalId = portalInfo.items[0].id
        
    // retrieve destination portal emails
    const getDestinationEmails = async (downloadPortalId) => {
        try {
            let emailArray = await getMembersFromPortal(downloadPortalId)
            let emailsOnly = []
            emailArray.items.map(item => {
                emailsOnly.push(item.email)
            })
            return emailsOnly
        } catch (error) {
            return error
        }
    }
    const destinationEmails = await getDestinationEmails(downloadPortalId)
    
    // retrieve package metadata
    const packageData = await getPackages(payload.portalDetails.id, payload.packageDetails.id)
    
    // standardize order of metadata keys
    let metadataFormatted = {
        'Sender name': packageData.metadata.senderName,
        'Sender email': packageData.metadata.senderEmail,
        'Show/Feature name': packageData.metadata.showFeatureName,
        'Package contents': packageData.metadata.packageContents
    }

    // convert JSON to string format
    let metadataToString = ''
    for (const [key, value] of Object.entries(metadataFormatted)) {
        metadataToString += (`${key}: ${value}\n`);
    }

    // send email to recipients
    let emailBody =
        'Package metadata:\n\n' +
        metadataToString + '\n\n' +
        mapping.emailBody + '\n' +
        mapping.applicationHost + "/request/" + payload.portalDetails.id + '.' + payload.packageDetails.id

    const sendEmails = async () => {
        let emailData = {
            to: destinationEmails,
            from: mapping.senderEmail,
            subject: mapping.emailSubject,
            emailBody
        }
        try {
            let result = await sendMail(emailData)
            console.log('Sendmail result:', result)
            return res.status(200).json({sendMailResult: result})
        } catch (error) {
            console.log('error', error)
            return res.status(400).json(error)
        }
    }

    await sendEmails()
    res.status(200).send()
}