var staticController = module.exports = Object.create(require('./ApplicationController.js'));

staticController.index = function () {
    this.setView('movie/index');
    this.respond(200);
};