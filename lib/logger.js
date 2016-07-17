"use strict";

var winston = require("winston"),
    moment = require("moment");

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            timestamp: function() {
                return moment().format('MMMM Do YYYY, hh:mm:ss.SSS ');
            }
        }),
        new(winston.transports.File)({
            filename: 'file.log'
        })
    ]
});

module.exports = logger;
