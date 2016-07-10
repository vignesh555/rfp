var app = require("./lib/serverConfig").app,
    mongoose = require("./lib/serverConfig").mongoose,
    restful = require("./lib/serverConfig").restful,
    config = require("config");

console.log(config.database.url);
//Database Configuration
mongoose.connect(config.database.url);

//Model Configuration
var registerRFPModel = require("./models/rfpModel").rfpTrackerModelExport;
registerRFPModel.register(app, '/rfp');

var portNumber = process.env.PORT || 8080;
//Server Start Up
app.listen(portNumber, function() {
    console.log("Server has been Started " + portNumber);
});
