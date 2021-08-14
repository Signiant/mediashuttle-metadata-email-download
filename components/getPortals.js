const config = require('../config');
var MediaShuttleApi = require('media_shuttle_api');
var defaultClient = MediaShuttleApi.ApiClient.instance;
var ApiKey = defaultClient.authentications['ApiKey'];
ApiKey.apiKey = config.keys.MS_API_KEY
var apiInstance = new MediaShuttleApi.PortalsApi();

module.exports = (url) => {
   return new Promise((resolve, reject) => {

      if (url) {
         var opts = {
            // String | Filter the response by portal access URL. The URL must include the \".mediashuttle.com\" domain suffix.
            'url': url
         };
      }

      var callback = function (error, data, response) {
         if (error) {
            reject(error)
         } else {
            resolve(data)
         }
      };

      apiInstance.getPortals(opts, callback);
   })
}