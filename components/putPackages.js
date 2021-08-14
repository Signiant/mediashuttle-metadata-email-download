const config = require('../config');
var MediaShuttleApi = require('media_shuttle_api');
var defaultClient = MediaShuttleApi.ApiClient.instance;
var ApiKey = defaultClient.authentications['ApiKey'];
ApiKey.apiKey = config.keys.MS_API_KEY

module.exports = (portalId, packageId, files) => {
    return new Promise((resolve, reject) => {
        var apiInstance = new MediaShuttleApi.SystemToPersonApi();
        var fileset = new MediaShuttleApi.FileSetRequest;
        fileset.files = files
   
        var callback = function (error, data, response) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        };

        apiInstance.putPackages(portalId, packageId, fileset, callback);
    })

}