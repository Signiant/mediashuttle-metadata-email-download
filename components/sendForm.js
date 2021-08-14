const path = require('path');

module.exports.sendForm = (req, res) => {
    return res.sendFile(path.join(__dirname, "../public/form.html"));
}