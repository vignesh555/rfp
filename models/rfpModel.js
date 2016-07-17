var rfpLogger = require("../lib/logger"),
    moment = require("moment"),
    restful = require('node-restful'),
    mongoose = restful.mongoose;


var rfpTrackerModel = restful.model('rfpTracker', mongoose.Schema({
        rfpStartDate: String,
        rfpEndDate: String,
        rfpEngagementType: String,
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
    }))
    .methods(['get', 'post', 'put', 'delete']);

rfpTrackerModel.before('get', function(req, res, next) {
    rfpLogger.log('info', 'Hello distributed log files!');
    next();
});

rfpTrackerModel.before('post', function(req, res, next) {
    rfpLogger.log('info', req.body);
    next();
});

rfpTrackerModel.after('post', function(req, res, next) {
    res.json({
        "status": "SuccessFully Saved"
    });
});

rfpTrackerModel.after('put', function(req, res, next) {
    res.json({
        "status": "SuccessFully Updated"
    });
});

rfpTrackerModel.after('delete', function(req, res, next) {
    res.json({
        "status": "SuccessFully Removed"
    });
});


var rfpModelTracker = function(app, mongoose, restful) {};

module.exports.rfpTrackerModelExport = rfpTrackerModel;
