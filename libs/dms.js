var fs = require('fs');

var exports = module.exports = {};

const developmentDBFile = 'data/development.json';

var dbFile = developmentDBFile;

function readFile() {
    return new Promise(function (success, fail) {
        fs.readFile(dbFile, function (err, data) {
            if (err) fail(err);
            else success(data);
        });
    });
}

function writeFile(data) {
    return new Promise(function (success, fail) {
        fs.writeFile(dbFile, data, function (err) {
            if (err) fail(err);
            else success();
        });
    });
}

function writeJson(json) {
    return writeFile(JSON.stringify(json));
}

function readJson() {
    return readFile().then(JSON.parse);
}

exports.getTable = function(tableName){
    return new Promise(function(success, fail){
        readJson().then(function (json) {
            if (json[tableName]) success(json[tableName]);
            fail();
        });
    });
};

exports.saveTable = function(tableName, content){
    return readJson().then(function (json) {
        json[tableName] = content;
        return writeJson(json);
    })
};