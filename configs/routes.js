/*

 GET	    /photos	photos#index	    display a list of all photos
 GET	    /photos/new	photos#new	    return an HTML form for creating a new photo
 POST	    /photos	photos#create	    create a new photo
 GET	    /photos/:id	photos#show	    display a specific photo
 GET	    /photos/:id/edit	        photos#edit	return an HTML form for editing a photo
 PATCH/PUT	/photos/:id	photos#update	update a specific photo
 DELETE	    /photos/:id	photos#destroy	delete a specific photo

 */

module.exports = [
    ['get', '', 'static#index'],
    ['get', 'movies/new', 'movie#new'],
    ['get', 'movies', 'movie#index'],
    ['post', 'movies', 'movie#create'],
    ['get', 'movies/:name', 'movie#show'],
    ['patch', 'movies/:name', 'movie#update'],
    ['get', 'movies/:name/edit', 'movie#edit'],
    ['patch', 'movies/:name', 'movie#update'],
    ['delete', 'movies/:name', 'movie#destroy'],
    ['get', 'search', 'search#search']
];