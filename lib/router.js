"use strict";

var bulkInsertCtrl = require("../controllers/bulkInsert");

module.exports = function(app) {
    app.post('/fileUpload', bulkInsertCtrl.parseMultidataForm);
};
