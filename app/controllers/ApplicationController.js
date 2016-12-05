var pug = require('pug'),
    fs = require('fs');
var applicationController = module.exports = {};

applicationController.variables = {};

applicationController.setView = function (view) {
    this.view = view
};

applicationController.setSync = function (sync) {
    this.sync = sync
};

applicationController.setReqRes = function (req, res) {
    this.req = req;
    this.res = res;
};

applicationController.setParams = function (params) {
    this.params = params;
};

applicationController.permit = function (modelName, attributes) {
    var obj = this;
    var param = {};
    var keys = Object.keys(obj.params).filter(function (p) {
        var exec = new RegExp(modelName + '\\[(\\w+)\\]').exec(p);
        return exec && attributes.indexOf(exec[1]) != -1;
    });
    keys.forEach(function (k) {
        var exec = new RegExp(modelName + '\\[(\\w+)\\]').exec(k);
        param[exec[1]] = obj.params[k];
    });
    return param;
};

applicationController.respond = function respond(code, text) {
    var contentType = 'text/html';
    var self = this;
    this.res.writeHead(code, {'Content-type': contentType});
    if (text) this.res.end(text, 'utf-8');
    else if (this.view != null) {
        pug.renderFile('app/views/' + this.view + '.pug',
            this.variables,
            function (err, html) {
                if (err) throw err;
                self.res.end(html, 'utf-8');
            });
    } else this.res.end(text, 'utf-8');
};

applicationController.end = function (code, contentType, text) {
    this.res.writeHead(code, {'Content-type': contentType});
    this.res.end(text, 'utf-8')
};

applicationController.sendFile = function (filename, contentType) {
    var self = this;
    contentType = contentType || 'text/html';
    fs.readFile(filename, function (error, content) {
        if (error != null) self.respond(404, "page not found");
        else {
            self.res.writeHead(200, {'Content-type': contentType});
            self.res.end(content, 'utf-8')
        }
    })
};