const config = require('../../../config');
const querystring = require('querystring');
const { generateSignedUrl } = require('../../../components/generateSignedUrl')

module.exports.processController = (req, res) => {

    console.log('processController req.body:', req.body)
    const form = querystring.parse(req.body);

    // lookup portal mapping to determine portal app settings
    const portalDomain = new URL(form.redirectUrl);
    const portalHost = portalDomain.host
    const portalMapping = config.portalMapping
    
    const mapping = portalMapping.find(item => {
        if (portalHost === item.uploadUrl) {
            return item
        }
    })

    const registrationKey = mapping.registrationKey;

    const signedUrl = generateSignedUrl(form.redirectUrl, req.body, registrationKey);
    res.set('Location', signedUrl);
    return res.status(307).end();
}