const config = require('../../../config');
const rp = require('request-promise');
const ejs = require('ejs');
const { generateSignedUrl } = require('../../../components/generateSignedUrl')


module.exports.showController = async (req, res) => {

    /* 
    1. Extract Media Shuttle package endpoint url from the redirectUrl request body parameter passed by Media Shuttle
    2. Invoke a GET request on this url to retrieve all known package details prior displaying the metadata form.
    3. The package endpoint url is the same as the redirectUrl without the /metadata suffix.
    */

    // Used for generating sign URL
    const portalPackageUrl = req.body.redirectUrl.replace(/\/metadata$/, '');
    console.log('showController req.body.redirectUrl:', req.body.redirectUrl)

    // lookup portal mapping to determine portal app settings
    const portalDomain = new URL(portalPackageUrl);
    const portalHost = portalDomain.host
    const portalMapping = config.portalMapping

    const mapping = portalMapping.find(item => {
        if (portalHost === item.uploadUrl) {
            return item
        }
    })

    const formUrl = mapping.applicationHost + '/form';

    // Generate a signed url for the above using the portal registration key.
    const signedPortalPackageUrl = generateSignedUrl(portalPackageUrl, '', mapping.registrationKey);

    setTimeout(() => {
        rp.get(signedPortalPackageUrl)
            .then(portalPackage => {
                let portalPackageJson = JSON.parse(portalPackage);
                return rp.get(formUrl)
                    .then(form => {
                        res.send(ejs.render(form, {
                            redirectUrl: req.body.redirectUrl,
                            senderEmail: portalPackageJson.packageDetails.sender
                        }));
                    });
            })
            .catch(err => {
                return res.status(500).send(err.message).end();
            });
    }, 500)
}
