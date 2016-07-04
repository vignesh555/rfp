module.exports = function(app, mongoose, restful) {
    var rfpTrackerModel = app.resource = restful.model('rfpTracker', mongoose.Schema({
            lastUpdateDate: Date,
            refName: String,
            client: String,
            techStack: String,
            vertical: String,
            location: String,
            pocName: String,
            pocId: Number,
            status: String,
            createdDate: {
                type: Date,
                default: Date.now
            }
        }))
        .methods(['get', 'post', 'put', 'delete']);

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

    rfpTrackerModel.register(app, '/rfp');
};
