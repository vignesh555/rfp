var multiparty = require('multiparty'),
    util = require('util'),
    xlsxj = require("xlsx-to-json"),
    moment = require("moment"),
    _ = require("underscore");
var registerRFPModel = require("../models/rfpModel").rfpTrackerModelExport;

var parseMultidataForm = function(req, resp, app) {
    var form = new multiparty.Form(),
        request = req,
        response = resp,
        app = app;
    form.parse(req, function(err, fields, files) {
        console.log(files.file);
        if (err) {
            console.log(err);
        }
        convertFiletoJSON(files, request, response, app);
    });
};

var modifyJson = function(resultObj) {
    resultObj.rfpStatus = resultObj["Status"];
    resultObj.rfpDate = resultObj["Date"];
    resultObj.rfpName = resultObj["RFP Name"];
    resultObj.rfpTechStack = resultObj["Tech Stach"];
    resultObj.rfpVertical = resultObj["Vertical"];
    resultObj.rfpPocName = resultObj["POC Name"];
    resultObj.rfpPocId = resultObj["POC ID"];
    resultObj.rfpClientName = resultObj["Client Name"];
    resultObj.rfpLocation = resultObj["Location"];

    delete resultObj["Status"];
    delete resultObj["Date"];
    delete resultObj["RFP Name"];
    delete resultObj["Tech Stach"];
    delete resultObj["Vertical"];
    delete resultObj["POC Name"];
    delete resultObj["POC ID"];
    delete resultObj["Client Name"];
    delete resultObj["Location"];

    return resultObj;
}

var convertFiletoJSON = function(files, req, resp, app) {
    var request = req,
        response = resp,
        app = app;

    xlsxj({
        input: files.file[0].path,
        output: "output.json"
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            _.each(result, function(resultObj) {
                resultObj = modifyJson(resultObj);
            });

            registerRFPModel.collection.insert(result, function(err, data) {
                response.send(data);
            });

        }
    });
};

module.exports.parseMultidataForm = parseMultidataForm;
