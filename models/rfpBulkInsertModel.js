var mongoose = require("mongoose");

var rfpBulkInsert = {
    rfpDate: String,
    rfpName: String,
    rfpClientName: String,
    rfpTechStack: String,
    rfpVertical: String,
    rfpLocation: String,
    rfpPocName: String,
    rfpPocId: Number,
    rfpStatus: String,
    rfpCreatedDate: {
        type: Date,
        default: Date.now
    }
};

var schema = new mongoose.Schema(rfpBulkInsert);
var rfpTrackerCollection = mongoose.model('rfpTracker1', schema);

module.exports.rfpTracker = rfpTrackerCollection;
