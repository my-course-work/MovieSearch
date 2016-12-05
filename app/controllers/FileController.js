var fileController = module.exports = Object.create(require('./ApplicationController.js'));

var fs = require('fs')
    , url = require('url')
    , marked = require('marked');

fileController.setPathname = function (pathname) {
    this.pathname = pathname;
};

fileController.css = function () {
    this.sendFile('public' + this.pathname, 'text/css');
};

fileController.js = function () {
    this.sendFile('public' + this.pathname, 'application/javascript');
};

fileController.png = function () {
    this.sendFile('public' + this.pathname, 'image/png');
};

fileController.jpg = function () {
    this.sendFile('public' + this.pathname, 'image/jpeg');
};

fileController.md = function () {
    this.setView('md');
    var self = this;
    fs.readFile('.' + url.parse(this.req.url).pathname, function (error, content) {
        if (error != null) fileController.respond(404, "page not found");
        else {
            self.variables['readme'] =  marked(content.toString());
            self.respond(200);
        }
    });
};