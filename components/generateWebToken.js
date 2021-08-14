require('dotenv').config()
const axios = require('axios');
const config = require('../config');
const getPortals = require('./getPortals');
const portalsPortalIdPackagesPost = require('./portalsPortalIdPackagesPost');
const putPackages = require('./putPackages')

module.exports = async (options) => {

   let { portalId, portalUrl, packageId, userEmail, grants, expiration, destinationPath, files, webhook } = options;

   if (!portalId && !portalUrl) {
      return ({ error: 'portalId or portalUrl is required' })
   }

   if (!userEmail) {
      return ({ error: 'user email required' })
   }

   if (grants === 'upload' && !files && !destinationPath) {
      return ({ error: 'file list and destinationPath required for upload grants' })
   }

   if (!expiration) {
      return ({ error: 'expiration required' })
   }

   if (!portalId) {
      try {
         portalDetails = await getPortals(portalUrl)
         portalId = portalDetails.items[0].id
      } catch (error) {
         return ({ error })
      }
   }

   const generatePackageId = async (packageId) => {
   
      if (packageId) return packageId

      let packageDetails = {};
      let newPackageId = {};

      try {
         packageDetails = await portalsPortalIdPackagesPost(portalId)
         newPackageId = packageDetails.id
      } catch (error) {
         return error
      }

      if (grants[0] === "download") {
         try {
            await putPackages(portalId, newPackageId, files)
         } catch (error) {
            return error
         }
      }
      return newPackageId
   }

   let newPackageId = await generatePackageId(packageId)

   let params = {
      method: 'POST',
      headers: { Authorization: config.keys.MS_API_KEY },
      url: config.settings.apiUrl +
         '/portals/' + portalId +
         '/packages/' + newPackageId +
         '/tokens',
      data: {
         user: { email: userEmail },
         expiresOn: expiration,
         grants
      }
   }

   if (grants === ['upload']) {
      params.destinationPath = destinationPath
   }

   if (webhook) {
      params.data.notifications =
         [
            {
               type: 'webhook',
               url: webhook
            }
         ]
   }
   
   let webTokenResult = {}
   try {
      webTokenResult = await axios(params)
   } catch (error) {
      return error
   }
   return webTokenResult.data
}
