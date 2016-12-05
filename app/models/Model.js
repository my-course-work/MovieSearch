var dms = require('../../libs/dms');

var Model = module.exports = {};

Model.find = function (key) {
    var self = this;
    return new Promise(function (success, fail) {
        dms.getTable(self.tableName).then(function (table) {
            if (table[key]) success(table[key]);
            fail();
        })
    });
};

Model.findAll = function () {
    return dms.getTable(this.tableName);
};

Model.findAllContains = function (key, caseSensitive) {
    var self = this;
    return new Promise(function (success, fail) {
        dms.getTable(self.tableName).then(function (table) {
            var keys = Object.keys(table).filter(function (k) {
                return caseSensitive ? k.indexOf(key) != -1 : k.toLowerCase().indexOf(key.toLowerCase()) != -1;
            });
            if (keys.length > 0) {
                var records = {};
                keys.forEach(function (k) {
                    records[k] = table[k];
                });
                success(records);
            }
            fail();
        });
    });
};

Model.save = function (key, value) {
    var self = this;
    return dms.getTable(this.tableName).then(function (table) {
        table[key] = value;
        return dms.saveTable(self.tableName, table);
    });
};

Model.add = function (key, value) {
    var self = this;
    return new Promise(function (success, fail) {
        var checkRes = self.check(key, value);

        if (Object.keys(checkRes).length == 0) {
            dms.getTable(self.tableName).then(function (table) {
                if (!table[key]) {
                    value['key'] = key;
                    table[key] = value;
                    dms.saveTable(self.tableName, table).then(function () {
                        success();
                    });
                } else fail(null);
            });
        } else fail(checkRes);
    });
};

Model.check = function (key, value) {
    return true;
};

Model.delete = function (key) {
    var self = this;
    return dms.getTable(this.tableName).then(function (table) {
        delete table[key];
        return dms.saveTable(self.tableName, table);
    });
};

Model.update = function (key, value) {
    var self = this;
    return new Promise(function (success, fail) {
        dms.getTable(self.tableName).then(function (table) {
            if (table[key]) {
                Object.keys(value).forEach(function (k) {
                    table[key][k] = value[k];
                    dms.saveTable(self.tableName, table).then(function () {
                        success();
                    });
                });
            }
            else fail(null);
        });
    });
};