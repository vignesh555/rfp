"use strict";

var multiparty = require('multiparty'),
    xlsxj = require('xlsx-to-json'),
    _ = require('underscore'),
    rfpLogger = require('../lib/logger');

var registerRFPModel = require("../models/rfpModel").rfpTrackerModelExport;

var deleteObj = function(resultObj) {
    delete resultObj.Status;
    delete resultObj["Start Date"];
    delete resultObj["End Date"];
    delete resultObj["RFP Name"];
    delete resultObj["Tech Stach"];
    delete resultObj.Vertical;
    delete resultObj["POC Name"];
    delete resultObj["POC ID"];
    delete resultObj["Client Name"];
    delete resultObj.Location;

    return resultObj;
};

var modifyJson = function(resultObj) {
    resultObj.rfpStatus = resultObj.Status;
    resultObj.rfpStartDate = resultObj["Start Date"];
    resultObj.rfpEndDate = resultObj["End Date"];
    resultObj.rfpName = resultObj["RFP Name"];
    resultObj.rfpTechStack = resultObj["Tech Stach"];
    resultObj.rfpVertical = resultObj.Vertical;
    resultObj.rfpPocName = resultObj["POC Name"];
    resultObj.rfpPocId = resultObj["POC ID"];
    resultObj.rfpClientName = resultObj["Client Name"];
    resultObj.rfpLocation = resultObj.Location;
    resultObj.rfpEngagementType = resultObj["Engagement Type"];

    return deleteObj(resultObj);
};

var convertFiletoJSON = function(files, request, response) {
    xlsxj({
        input: files.file[0].path,
        output: "output.json"
    }, function(err, result) {
        if (err) {
            rfpLogger.log('error', err);
        } else {
            rfpLogger.log('info', result);
            _.each(result, function(resultObj) {
                resultObj = modifyJson(resultObj);
            });

            registerRFPModel.collection.insert(result, function(err, data) {
                response.send(data);
            });

        }
    });
};

var parseMultidataForm = function(request, response, app) {
    var form = new multiparty.Form();

    form.parse(request, function(err, fields, files) {
        rfpLogger.log('info', files.file);
        if (err) {
            rfpLogger.log('error', err);
        }
        convertFiletoJSON(files, request, response, app);
    });
};





module.exports.parseMultidataForm = parseMultidataForm;
