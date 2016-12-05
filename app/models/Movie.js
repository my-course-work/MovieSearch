var Movie = module.exports = Object.create(require('./Model'));
Movie.tableName = 'movie';

Movie.check = function(key, value) {
    var err = {};
    if (!value['title'] || value['title'] == '') err['movie[title]'] = 'Movie title cannot be empty.';
    return err;
};