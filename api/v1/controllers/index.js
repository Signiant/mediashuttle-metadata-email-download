const express = require('express');
const router = express.Router();

const {sendForm} = require('../../../components/sendForm')
const {showController} = require('./showController')
const {processController} = require('./processController')
const {webhookController} = require('./webhookController')
const {requestController} = require('./requestController')

router.use('/form', sendForm)
router.post('/show', express.urlencoded({extended: true}), showController)
router.post('/process', express.text({ type: '*/*' }), processController)
// router.post('/show', showController)
// router.post('/process', processController)
router.post('/webhook/upload', express.json(), webhookController)
router.get('/request/:key', requestController)
module.exports = router;