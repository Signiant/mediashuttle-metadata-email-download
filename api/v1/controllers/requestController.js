/*
Module workflow:
    1. Receive GET /request/request/:key
        key = portalId.packageId
    2. Generates S2P download token link
    3. Redirects to link at *.mediashuttle.com
*/
const { portalMapping } = require('../../../config')
const getPortals = require("../../../components/getPortals.js")
const getPackages = require("../../../components/getPackages.js")
const getPortalsPackagesFiles = require("../../../components/getPortalsPackagesFiles.js")
const generateWebToken = require("../../../components/generateWebToken.js")

module.exports.requestController = async (req, res) => {

    console.log('requestController', req)
    
    // extract the keys from formatted email request format: /request/:key (portalId.packageId)
    const portalId = req.params.key.substring(0, 36)
    const packageId = req.params.key.substring(37, 59)

    // find and retrieve upload portal details
    const accountsPortals = await getPortals()
    
    const uploadPortal = accountsPortals.items.find(item => portalId === item.id)

    const uploadPortalUrl = uploadPortal.url
    
    // retrieve package details including metadata
    // const uploadPackageDetails = await getPortalsPackages(portalId, packageId)
    const uploadPackageDetails = await getPackages(portalId, packageId)
    
    // determine download portal to use for token generation
    const mapping = portalMapping.find(item => uploadPortalUrl === item.uploadUrl)
    const downloadPortalUrl = mapping.downloadUrl
        
    // retrieve package files array
    const uploadPackageFiles = await getPortalsPackagesFiles(portalId, packageId)

    /*
    Convert file paths to storage paths.
    Uploaded files include the original local disk path. Download paths are in the format senderEmail/packageId/file-folderName
    */
    // const rootPath = uploadPackageDetails.data.metadata.senderEmail + '/' + uploadPackageDetails.data.id + '/'
    const rootPath = uploadPackageDetails.metadata.senderEmail + '/' + uploadPackageDetails.id + '/'

    let downloadPackageFiles = []

    uploadPackageFiles.files.map(item => {
        let n = item.path.split("/");
        downloadPackageFiles.push({
            path: rootPath + n[n.length - 1],
            isDirectory: item.isDirectory,
            size: item.size
        })
    })

    // determine upload portals expiration criteria
    // requires more work to calculate dynamic expiration based on config file
    let expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + 10000);

    // retrieve download token
    let params = {
        portalUrl: downloadPortalUrl,
        userEmail: mapping.senderEmail,
        grants: ["download"],
        expiration,
        files: downloadPackageFiles
    }

    try {
        let downloadToken = await generateWebToken(params)
        res.status(200).redirect(downloadToken.url)
    } catch (error) {
        res.status(400).json(error)
    }

}