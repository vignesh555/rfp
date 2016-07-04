var app = require("./lib/serverConfig").app,
    mongoose = require("./lib/serverConfig").mongoose,
    restful = require("./lib/serverConfig").restful,
    config = require("config");


//Database Configuration
mongoose.connect(config.database.url);

//Model Configuration
require("./models/rfpModel")(app, mongoose, restful);

//Server Start Up
app.listen(config.server.portNumber, function() {
    console.log("Server has been Started " + config.server.portNumber);
});
