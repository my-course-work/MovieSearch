var url = require('url'),
    routes = require('./../configs/routes'),
    config = require('./../configs/config'),
    qs = require('querystring');

var exports = module.exports = {};

exports.resolve = function (req, res) {
    var rUrl = url.parse(req.url);
    var rMethod = req.method;
    var r = routes.filter(function (route) {
        var rPaths = route[1].split('/');
        var pathname = rUrl.pathname.substring(1);
        var paths = pathname.split('/');
        if (paths.length != rPaths.length && pathname != route[1] + '/') return false;
        for (var i = 0; i < rPaths.length; i++) {
            var rPath = rPaths[i];
            var match = rPath.match(/^:\w+/);
            if(match && paths[i] == '') return false;
            else if (!match && rPath != paths[i]) return false;
        }
        return route[0].toLowerCase() == rMethod.toLowerCase()
    });

    var controller;
    if (r.length > 0) {
        var action = r[0][2];
        var arr = action.split('#');
        controller = Object.create(config.controllers[arr[0]]);
        getParams(req, rUrl, r).then(function(params){
            controller.setParams(params);
            controller.setReqRes(req, res);
            controller.setView(arr[0] + '/' + arr[1]);
            if (controller[arr[1]]) {
                controller[arr[1]].call(controller);
                if (controller.sync) controller.respond(200);
            }
            else {
                res.writeHead(404, {'Content-type': 'text/html'});
                res.end('Action not found', 'utf-8')
            }
        });
    } else {
        controller = Object.create(config.controllers['file']);
        getParams(req, rUrl).then(function(params) {
            controller.setParams(params);
            controller.setReqRes(req, res);
            controller.setPathname(rUrl.pathname);
            var paths = rUrl.pathname.substring(1).split('/');
            var filename = paths[paths.length - 1];
            var extension = filename.substring(filename.indexOf('.') + 1);
            if (controller[extension]) controller[extension].call(controller);
            else {
                res.writeHead(404, {'Content-type': 'text/html'});
                res.end('Resource not found', 'utf-8')
            }
        });
    }
};

function getParams(req, rUrl, route) {
    return new Promise(function(success, fail){
        if(req.method == 'POST' || req.method == 'PATCH') {
            var body = '';
            // Haven't implemented file upload yet
            req.on('data', function(data){
                body += data;
            });

            req.on('end', function(){
                var params = qs.parse(body);
                if (route) {
                    var rPaths = route[0][1].split('/');
                    var paths = rUrl.pathname.substring(1).split('/');
                    for (var i = 0; i < rPaths.length; i++) {
                        var rPath = rPaths[i];
                        var match = rPath.match(/^:(\w*)/);
                        if (match) params[match[1]] = decodeURI(paths[i].replace(/\+/g,'%20'));
                    }
                }
                success(params);
            });
        } else {
            var params = qs.parse(rUrl.query);

            if (route) {
                var rPaths = route[0][1].split('/');
                var paths = rUrl.pathname.substring(1).split('/');
                for (var i = 0; i < rPaths.length; i++) {
                    var rPath = rPaths[i];
                    var match = rPath.match(/^:(\w*)/);
                    if (match) params[match[1]] = decodeURI(paths[i].replace(/\+/g,'%20'));
                }
            }
            success(params);
        }
    });
}
