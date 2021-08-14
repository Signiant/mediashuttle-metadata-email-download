const serverless = require("serverless-http");
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const routes = require('./api/v1/controllers/index');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

//     app.listen(port, () => {
//     console.log('App listening on ' + port + ' @ ' + (new Date()).toLocaleString());
// });

module.exports.handler = serverless(app);
