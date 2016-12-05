var fs = require('fs');
var exports = module.exports = {};
fs.readdir('./app/controllers', function (err, files) {
    exports.controllers = {};
    files.forEach(function (file) {
        var controllerName = /(\w+)Controller/g.exec(file)[1].toLowerCase();
        exports.controllers[controllerName] = require('../app/controllers/' + file);
    });
});