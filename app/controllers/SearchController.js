var searchController = module.exports = Object.create(require('./ApplicationController.js'));
var Movie = require('../models/Movie'),
    imdb = require('imdb-api');

searchController.search = function () {
    var res = this.res;
    var req = this.req;
    var param = this.params;
    this.setView('movie/index');
    if (param['q'] != null) {
        if (req.headers['accept'] == 'application/json/keys') {
            Movie.findAllContains(param['q'])
                .then(function (results) {
                    res.end(JSON.stringify(Object.keys(results)));
                }, function () {
                    res.end(JSON.stringify({}));
                });

        } else if(req.headers['accept'] == 'application/json') {
            Movie.findAllContains(param['q'])
                .then(function (results) {
                    res.end(JSON.stringify(results));
                }, function () {
                    imdb.getReq({name: param['q']}, function (err, movie) {
                        if(!err) {
                            Movie.add(movie.title, movie).
                            then(function () {
                                var movies = {};
                                movies[movie.title] = movie;
                                res.end(JSON.stringify(movies));
                            });
                        }
                    });
                });
        } else this.respond(200);

    } else this.end(404);
};