var movieController = module.exports = Object.create(require('./ApplicationController.js'));
var Movie = require('../models/Movie');

movieController.index = function () {
    var self = this;
    Movie.findAll()
        .then(function (movies) {
            self.end(200, 'application/json', JSON.stringify(movies));
        });
};

movieController.show = function () {
    var req = this.req;
    var res = this.res;
    var self = this;
    var name = this.params['name'];
    Movie.find(name)
        .then(function (movie) {
            if (req.headers['accept'] == 'application/json')
                res.end(JSON.stringify(movie));
        }, function () {
            self.respond(404, 'Movie not found');
        });
};

/*

 GET	    /photos	photos#index	    display a list of all photos
 GET	    /photos/new	photos#new	    return an HTML form for creating a new photo
 POST	    /photos	photos#create	    create a new photo
 GET	    /photos/:id	photos#show	    display a specific photo
 GET	    /photos/:id/edit	        photos#edit	return an HTML form for editing a photo
 PATCH/PUT	/photos/:id	photos#update	update a specific photo
 DELETE	    /photos/:id	photos#destroy	delete a specific photo

 */

movieController.new = function () {
    this.setSync(true);
};

movieController.create = function () {
    var param = movieParams(this);
    var self = this;
    Movie.add(param['title'], param).then(function () {
        Movie.findAll()
            .then(function () {
                self.end(200);
            });
    }, function (err) {
        self.end(400, 'application/json', JSON.stringify(err));
    });
};

movieController.destroy = function () {
    var self = this;
    Movie.delete(this.params["name"]).then(function () {
        self.end(200);
    });
};

movieController.update = function () {
    var key = this.params['name'];
    var params = movieParams(this);
    var self = this;
    Movie.update(key, params).then(function(){
        self.end(200);
    });
};

function movieParams(self) {
    return self.permit('movie',
        [
            'title',
            'rating',
            'languages',
            'released',
            'runtime',
            'genres',
            'director',
            'writer',
            'actor',
            'plot'
        ]);
}