Movie Search
============

A cross device user friendly movie search website. 

[Admin Panel](/)

**Update Dec4, 2016**
---
 - Click event
    - onClick: An DOM element can have one click handler at a time with onClick property
        - Attached to share result button. Open share result dialog when clicked and show black cover.
        - Attached to scroll up button. Scroll to the top of the page when clicked.
             ```pug
                div#share-result-button(title="Share the result", onclick="showSharedResultDialog()")
                    i(class="material-icons")
                div#scroll-up-button(title="Scroll to the top", onclick="scrollToTop()")
                    i(class="material-icons") vertical_align_top
            ```
        
            ```javascript
            function scrollToTop() {
                transition({
                    target: document.body,
                    property: 'scrollTop',
                    from: document.body.scrollTop,
                    to: 0,
                    duration: 400
                });
            }
            
            function showSharedResultDialog() {
                shareResultDialogInput.value = window.location.href;
                showBlackCover();
                shareResultDialogInput.setSelectionRange(0, shareResultDialogInput.value.length);
                addClass(shareResultDialog, 'active');
                removeClass(shareResultButton, 'active');
            }
  
            function showBlackCover() {
                blackCover.style.display = 'block';
                blackCover.style.height = Math.max(document.documentElement.offsetHeight, window.innerHeight) + 'px';
            }
            ```
    - click
    
        - Attached to black cover. Click to hide black cover.
        ```javascript
        blackCover.addEventListener('click', function () {
                removeClass(header, 'active');
                removeClass(resultBox, 'active');
                removeClass(doneButton, 'active');
                resultBox.style.marginTop = -resultBox.clientHeight - header.clientHeight + "px";
                hideBlackCover();
                searchInput.blur();
                removeClass(shareResultDialog, 'active');
                if (newMovieDialog)
                    removeClass(newMovieDialog, 'active');
                addClass(shareResultButton, 'active');
            });
        
        function hideBlackCover() {
            blackCover.style.height = '0px';
            blackCover.style.display = 'none';
        }
        ```
        
        - Attached to td. Click to clear innerText of td.
        ```javascript
            li.querySelectorAll('[data-method=patch]').forEach(function (label) {
                label.addEventListener('click', editListener);
            });

            function editListener(e) {
                var label = e.target;
                label.innerText = '';
                var input = getEditable(label.dataset.inputType, label.dataset.value || '');
                var wrapper = document.createElement('div');
                wrapper.appendChild(input);
                label.appendChild(wrapper);
            
                label.removeEventListener('click', editListener);
                addClass(label, 'editing');
                input.focus();
            
                input.addEventListener('blur', function (inputEvent) {
                    inputEvent.stopPropagation();
                    ajax('movies/' + encodeURI(label.dataset.key), 'PATCH', label.dataset.name + '=' + input.value)
                        .then(function () {
                            label.dataset.value = input.value;
                            label.innerText = label.dataset.value;
                            label.addEventListener('click', editListener);
                            removeClass(label, 'editing');
                        });
                });
            
                input.addEventListener('keydown', function (inputEvent) {
                    if (inputEvent.key == 'Escape' || inputEvent.key == 'Enter')
                        input.blur();
                });
            }
        ```
        
- Key down event
    - Attached to search box. Hide search result when press down enter or esc key.
    ```javascript
    input.addEventListener('keydown', function (inputEvent) {
                            if (inputEvent.key == 'Escape' || inputEvent.key == 'Enter')
                                input.blur();
                        });
    ```
- Blur event
    - Attached to input inside td. Save movie info on to the server when input is blurred.
    ```
    input.addEventListener('blur', function (inputEvent) {
            inputEvent.stopPropagation();
            ajax('movies/' + encodeURI(label.dataset.key), 'PATCH', label.dataset.name + '=' + input.value)
                .then(function () {
                    label.dataset.value = input.value;
                    label.innerText = label.dataset.value;
                    label.addEventListener('click', editListener);
                    removeClass(label, 'editing');
                });
        });
    ```
- Scroll event
    - Attached to window. Hide scroll to top button when page is scrolled to the top
    ```javascript
    window.onscroll = function () {
            if (scrollButton) {
                if (document.body.scrollTop > 0)
                    addClass(scrollButton, 'active');
                else
                    removeClass(scrollButton, 'active');
            }
    
        };
    ```

- Input event
    - Attached to search bar text input. Show search result when input changed.
    ```javascript
    searchInput.addEventListener('input', function (e) {
                if (e.target.value != '') {
                    document.title = e.target.value;
                    window.history.pushState(e.target.value, 'search', 'search?q=' + e.target.value);
                } else {
                    document.title = 'Welcome to Movie Search!';
                    window.history.pushState('Welcome to Movie Search!', 'home', '/');
                }
                sendSearchRequestAutoComplete(e.target.value);
            });
    ```

- Load event
    - Attached to XMLHTTPRequest. 
    Add movie record on to the page using innerHTML(work with HTML rich text and doesn't automatically encode and decode text as innerText did) when got response from server.
    ```javascript
    function ajax(url, method, data, format) {
        return new Promise(function (succeed, fail) {
            var req = new XMLHttpRequest();
            req.open(method, url, true);
            req.addEventListener('load', function () {
                if (req.status < 400) succeed(req.responseText);
                else fail(req.responseText);
            });
            req.addEventListener("error", function () {
                fail(new Error("Network error"));
            });
            req.setRequestHeader('Accept', format);
            req.send(data);
        });
    }
  
    function addMovie(movie) {
        var li = document.createElement('li');
        li.className = 'movie';
        li.innerHTML =
            '<img src=' + movie['poster'] + '>' +
            '<section>' +
            '<h1 data-method="patch" data-key="' + movie['key'] + '" data-name="movie[title]" data-value="' + movie['title'] + '" data-input-type="input">' + movie['title'] + '</h1>' +
            '<table>' +
            '<tbody>' +
            '<tr class="rating">' +
            '<td>Rating</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[rating]" data-value="' + movie['rating'] + '">' + movie['rating'] + '</td>' +
            '</tr>' +
            '<tr class="languagage">' +
            '<td>Language</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[languages]" data-value="' + movie['languages'] + '">' + movie['languages'] + '</td>' +
            '</tr>' +
            '<tr class="released">' +
            '<td>Release</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[released]" data-value="' + movie['released'] + '">' + movie['released'] + '</td>' +
            '</tr>' +
            '<tr class="runtime">' +
            '<td>Runtime</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[runtime]" data-value="' + movie['runtime'] + '">' + movie['runtime'] + '</td>' +
            '</tr>' +
            '<tr class="genres">' +
            '<td>Genres</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[genres]" data-value="' + movie['genres'] + '">' + movie['genres'] + '</td>' +
            '</tr>' +
            '<tr class="director">' +
            '<td>Director</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[director]" data-value="' + movie['director'] + '">' + movie['director'] + '</td>' +
            '</tr>' +
            '<tr class="writer">' +
            '<td>Writer</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[writer]" data-value="' + movie['writer'] + '">' + movie['writer'] + '</td>' +
            '</tr>' +
            '<tr class="actors">' +
            '<td>Actor</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="input" data-name="movie[actor]" data-value="' + movie['actor'] + '">' + movie['actor'] + '</td>' +
            '</tr>' +
            '<tr class="plot">' +
            '<td>Plot</td>' +
            '<td data-method="patch" data-key="' + movie['key'] + '" data-input-type="textarea" data-name="movie[plot]" data-value="' + movie['plot'] + '">' + movie['plot'] + '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</section>' +
            '<ul class="actions">' +
            '<li>' +
            '<a href="/movies/' + movie['key'] + '" data-method="delete" title="Delete ' + movie['title'] + '">' +
            '<i class="material-icons">remove_circle</i>' +
            '</a>' +
            '</li>' +
            '</ul>';
        movieList.insertBefore(li, movieList.firstChild);
    
        li.querySelectorAll('[data-method=patch]').forEach(function (label) {
            label.addEventListener('click', editListener);
        });
    
        li.querySelectorAll('a[data-method=delete]').forEach(function (link) {
            link.addEventListener('click', deleteMovieListener);
        });
    }
    ```
    
- Transitionend Event
    - Attached to movie info li. Remove deleted movie record when css transition finished.
    ```javascript
    li.addEventListener('transitionend', function () {
                if (li.parentNode) li.parentNode.removeChild(li);
            });
    ```

Features
--------
 - Support inline movie info editing
 - Support AJAX for adding, deleting and filtering movies
 - Support updating URL when tying movie title for filtering
 - Allow administrator to add movie information through web pages
 - Allow administrator to delete movie information through web pages
 - Restrict controls to administrator
 - Support movie information validation
 - Add file data controller
 - Add a extensible router
 - Automatically direct traffics to corresponding controller
 - Add reusable layouts
 - Add base model controller and Movie module
 - Support preview poster in browser
 - Support sending HTTP DELETE request through AJAX
 - Support searching result auto-complete
 - Support sharing the search result through link
 - Support auto copy search result link
 - Support searching keywords highlighting
 - Support showing all movies on the homepage
 - Support responsive user experience cross mobile, table and desktop devices
 - Support heroku one command deployment
 
 TODO:
 - Implement database handler for performance
 - Implement access control

Technologies
------------
This backend of this fancy look website is based on **nodeJs**, a powerful language made file reading, routing and request handling super convenient. 
The backend used few libraries to complete the job, **http** for handling http request and response, **fs** for asynchronous file reading, **url** for query parameter parsing, 
**imdb-api** for data provider API, and **pug** for webpage template processing.
The backend implemented a MVC framework, automatically dispatch requests to corresponding controller action.
The backend automatically render **pug** template with instance variables of controller.
Form data validation if handled by each corresponding model, rendering flash message to show out the validation results.

The front end mainly utilized **SASS** to simplify styling, with its strongest on style reusing.
The front-end followed material design guide line, implemented group of material components, including animated ripple button and animated form inputs.
And the **CSS3 media query** helped to create responsive layouts on difference screens and devices, by specifying range of device width.
The **CSS3 transition** greatly build graceful segues between application state, improved the user experience of the site.
The site also used Google's material icon font to implement comprehensible buttons.

Implementations
---------------

The backend implemented a router to handle http requests.
```javascript
    
    // match request
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
    
    // Render views
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
```

The router dynamically dispatch actions based on human readable routing configuration.
```javascript
module.exports = [
    ['get', '', 'movie#index'],
    ['get', 'movies/new', 'movie#new'],
    ['get', 'movies', 'movie#index'],
    ['post', 'movies', 'movie#create'],
    ['get', 'movies/:name', 'movie#show'],
    ['get', 'movies/:name/edit', 'movie#edit'],
    ['patch', 'movies/:name', 'movie#update'],
    ['delete', 'movies/:name', 'movie#destroy'],
    ['get', 'search', 'search#search']
];
```

---

Application controller implemented **permit** method to filter query parameters.
```javascript
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
```

It also implemented **respond** method to render corresponding views for actions
```javascript
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

```

---

The FileController handles all the file requests and renders README file.

```javascript
/* Colors */
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
```

---

The MovieController handles Movie CRUD actions.

Index action retrieves all the movies in the file system
```javascript
movieController.index = function () {
    var self = this;
    Movie.findAll()
        .then(function (movies) {
            self.end(200, 'application/json', JSON.stringify(movies));
        });
};
```

Show action retrieves detailed movie information.
```javascript
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
```

New action renders add movie form.

Create action saves movie into the file system.
```javascript
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
```

Destroy action delete a given movie from the storage.
```javascript
movieController.destroy = function () {
    var self = this;
    Movie.delete(this.params["name"]).then(function () {
        self.end(200);
    });
};
```

The **movieParams** filters out unwanted form data.
```
function movieParams(self) {
    return self.permit('movie',
        ['title',
            'rating',
            'languages',
            'released',
            'runtime',
            'genres',
            'director',
            'writer',
            'actor']);
}
```

--- 

The SearchController handles search requests.
```javascript
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
```

The system also implements Object Relation Mapping.
The following code shows base model helpers
```javascript
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
```

and Movie model
```javascript
var Movie = module.exports = Object.create(require('./Model'));
Movie.tableName = 'movie';

Movie.check = function(key, value) {
    var err = {};
    if (!value['title'] || value['title'] == '') err['movie[title]'] = 'Movie title cannot be empty.';
    return err;
};
```

---

The **pug** files are used to render corresponding HTML.

**layout.pug**
```pug
doctype html
html(lang="en")
    head
        meta(name="viewport", content="width=device-width, initial-scale=1")
        block title
            title=''
        link(href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet")
        link(rel='stylesheet', href='/styles/style.css')
        block styles
        script(src='/scripts/script.js')
        block scripts
    body
        header
            div.center
                div.logo
                    a(href="/", title="Go to movie search homepage") Movie Search
                block header
            i(class="material-icons") menu
        block content
        div#black-cover
        block dialogs
        block buttons
        block flash-message
```

**movie.pug**
```pug
extends ../app/layout
block header
    div.search-form
        div(class="search", id="search-form")
            div(class="search-field")
                input(type="text", name="q", value=query, autocomplete="off", placeholder="Please type in movie name")
            div(class="submit-button", id="submit-button", title="Search movie")
                i(class="material-icons") search
block content
    div.center.float
        ul.search-result
    #content.center.movies
        a(href='/movies/new', class='add-movie-button', title='Add new movie')
            i(class="material-icons") add
        ul#movie-list
        block footer
            footer
                p Want's to know how I build this?
                p Checkout #[a(href="/README.md") README] here.

block dialogs
    div.dialog#share-result-dialog
        div.content
            h1 Share search result
            p Share result with others through the following link.
            div
                input(value="http://localhost:8080/search?q=bat")
            div
                button Copy and close
    div.dialog.center#new-movie-dialog
        h1 Add New movie
        div.content
            div.new-movie
                form(id='new-movie-form')
                    ul.linear-view-two
                        li
                            ul
                                li
                                    input(type='text', class='text-input', name='movie[title]', autocomplete='off')
                                    label Name
                                li
                                    input(type='text',class='text-input', name='movie[rating]', autocomplete='off')
                                    label Rating
                                li
                                    input(type='text',class='text-input', name='movie[languages]', autocomplete='off')
                                    label Languages
                                li
                                    input(type='text',class='text-input', name='movie[released]', autocomplete='off')
                                    label Release Date
                                li
                                    input(type='text', class='text-input',name='movie[runtime]', autocomplete='off')
                                    label Run Time
                                li
                                    input(type='text',class='text-input', name='movie[genres]', autocomplete='off')
                                    label Genres
                        li
                            ul
                                li
                                    input(type='text',class='text-input', name='movie[director]', autocomplete='off')
                                    label Director
                                li
                                    input(type='text',class='text-input', name='movie[writer]', autocomplete='off')
                                    label Writer
                                li
                                    input(type='text',class='text-input', name='movie[actor]', autocomplete='off')
                                    label Actor
                                li
                                    textarea(class='text-input', name='movie[plot]', rows='3', autocomplete='off')
                                    label Plot
            div
                button(id='submit-new-movie-btn') Add movie
block buttons
    div#done-button
        i(class="material-icons") done
    div#share-result-button(title="Share the result")
        i(class="material-icons")
    div#scroll-up-button(title="Scroll to the top")
        i(class="material-icons") vertical_align_top

```

---

The front end used AJAX to send HTTP requests.
```javascript
/**
 * Return ajax promise
 * @param {string} url - The request url
 * @param {string} method - The request method
 * @param {string} data - The request data
 * @param {string} format - The response format
 *
 * @return ajax promise
 */
function ajax(url, method, data, format) {
    return new Promise(function (succeed, fail) {
        var req = new XMLHttpRequest();
        req.open(method, url, true);
        req.addEventListener('load', function () {
            if (req.status < 400) succeed(req.responseText);
            else fail(req.status, new Error(req.statusText));
        });
        req.addEventListener("error", function () {
            fail(new Error("Network error"));
        });
        req.setRequestHeader('Accept', format);
        req.send(data);
    });
}
```

The site displays add new movie dialog with the following code
```javascript
submitNewMovieButton.addEventListener('click', function () {
            var formData = '';

            newMovieForm.querySelectorAll('input, textarea').forEach(function (field) {
                formData += encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value) + '&';
            });

            ajax('movies', 'POST', formData).then(function () {
                hideBlackCover();
                var data = {};
                newMovieForm.querySelectorAll('input, textarea').forEach(function (field) {
                    data[field.name] = field.value;
                });
                pullMovieList();
                removeClass(newMovieDialog, 'active');
            }, function (err) {
            });
        });
```

The site implements inline movie info editing through
 ```javascript
function editListener (e) {
    var label = e.target;
    label.innerHTML = '';
    var input = getEditable(label.dataset.inputType, label.dataset.value || '');
    var wrapper = document.createElement('div');
    wrapper.appendChild(input);
    label.appendChild(wrapper);

    label.removeEventListener('click', editListener);
    addClass(label, 'editing');
    input.focus();

    input.addEventListener('blur', function (inputEvent) {
        inputEvent.stopPropagation();
        ajax('movies/' + encodeURI(label.dataset.key), 'PATCH', label.dataset.name + '=' + input.value)
            .then(function () {
                label.dataset.value = input.value;
                label.innerHTML = label.dataset.value;
                label.addEventListener('click', editListener);
                removeClass(label, 'editing');
            });
    });

    input.addEventListener('keydown', function (inputEvent) {
        if (inputEvent.key == 'Escape' || inputEvent.key == 'Enter')
            input.blur();
    });
}
```

The site also changes URL on typing
```javascript
searchInput.addEventListener('input', function (e) {
            if (e.target.value != '') {
                document.title = e.target.value;
                window.history.pushState(e.target.value, 'search', 'search?q='+e.target.value);
            } else {
                document.title = 'Welcome to Movie Search!';
                window.history.pushState('Welcome to Movie Search!', 'home', '/');
            }
            sendSearchRequestAutoComplete(e.target.value);
        });
```

Pull movie lists from server:
```javascript
function pullMovieList() {
    ajax('movies', 'GET')
        .then(function(data){
            movieList.innerHTML = '';
            var movies = JSON.parse(data);
            Object.keys(movies).forEach(function(k){
                addMovie(movies[k]);
            });
        });
}
```

Generate and display new movie:
```javascript
function addMovie(movie) {
    var li = document.createElement('li');
    li.className = 'movie';
    li.innerHTML =
        '<img src='+movie['poster']+'>'+
        '<section>'+
        '<h1 data-method="patch" data-key="'+movie['key']+'" data-name="movie[title]" data-value="'+movie['title']+'" data-input-type="input">'+movie['title']+'</h1>'+
        '<table>'+
        '<tbody>'+
        '<tr class="rating">'+
        '<td>Rating</td>'+
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[rating]" data-value="'+movie['rating']+'">'+movie['rating']+'</td>'+
        '</tr>'+
        '<tr class="languagage">'+
        '<td>Language</td>'+
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[languages]" data-value="'+movie['languages']+'">'+movie['languages']+'</td>'+
        '</tr>'+
        '<tr class="released">'+
        '<td>Release</td>'+
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[released]" data-value="'+movie['released']+'">'+movie['released']+'</td>'+
        '</tr>'+
        '<tr class="runtime">' +
        '<td>Runtime</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[runtime]" data-value="'+movie['runtime']+'">'+movie['runtime']+'</td>' +
        '</tr>' +
        '<tr class="genres">' +
        '<td>Genres</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[genres]" data-value="'+movie['genres']+'">'+movie['genres']+'</td>' +
        '</tr>' +
        '<tr class="director">' +
        '<td>Director</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[director]" data-value="'+movie['director']+'">'+movie['director']+'</td>' +
        '</tr>' +
        '<tr class="writer">' +
        '<td>Writer</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[writer]" data-value="'+movie['writer']+'">'+movie['writer']+'</td>' +
        '</tr>' +
        '<tr class="actors">' +
        '<td>Actor</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="input" data-name="movie[actor]" data-value="'+movie['actor']+'">'+movie['actor']+'</td>' +
        '</tr>' +
        '<tr class="plot">' +
        '<td>Plot</td>' +
        '<td data-method="patch" data-key="'+movie['key']+'" data-input-type="textarea" data-name="movie[plot]" data-value="'+movie['plot']+'">'+movie['plot']+'</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</section>' +
        '<ul class="actions">' +
        '<li>' +
        '<a href="/movies/'+movie['key']+'" data-method="delete" title="Delete '+movie['title']+'">' +
        '<i class="material-icons">remove_circle</i>' +
        '</a>' +
        '</li>' +
        '</ul>';
    movieList.insertBefore(li, movieList.firstChild);

    li.querySelectorAll('[data-method=patch]').forEach(function (label) {
        label.addEventListener('click', editListener);
    });

    li.querySelectorAll('a[data-method=delete]').forEach(function (link) {
        link.addEventListener('click', deleteMovieListener);
    });
}
```

The script also generates delete movie actions through AJAX 
```javascript
function deleteMovieListener(e) {
        e.preventDefault();

        ajax(e.target.parentNode.href, 'DELETE').then(function () {
            console.log(e.target.parentNode.href);
            var li = findParent(e.target, '.movie');
            li.addEventListener('transitionend', function () {
                if (li.parentNode) li.parentNode.removeChild(li);
            });
            li.style.left = -(contentContainer.offsetLeft + li.offsetWidth) + 'px';
            li.style.opacity = 0;
        });
}
```


The site also built transition generator for scrolling animations:
```javascript
function transition(obj) {
    var target = obj['target'];
    var property = obj['property'];
    var startVal = obj['from'];
    var endVal = obj['to'];
    var duration = obj['duration'];
    var curr = startVal;


    var step = (endVal - startVal) / duration * 10;
    console.log(step);
    var timer = window.setInterval(function(){
        curr += step;
        target[property] = curr;
        if (step > 0 && curr >= endVal) window.clearInterval(timer);
        else if (step < 0 && curr <= endVal) window.clearInterval(timer);
    }, 10);
}
```

Add and remove classes:
```javascript
/**
 * Add a class to a DOM object
 * @param {HTMLElement} dom - The DOM object
 * @param {string} className - The class name to add
 */
function addClass(dom, className) {
    if (dom.className.indexOf(className) == -1)
        dom.className += dom.className.length > 0 ? ' ' + className : className;
}

/**
 * Remove a class from a DOM object
 * @param {HTMLElement} dom - The DOM object
 * @param {string} className - The class name to remove
 */
function removeClass(dom, className) {
    dom.className = dom.className.replace(new RegExp('\\s?' + className, 'g'), '')
}
```

The frontend implemented animations for text inputs with the following code:
```SASS
.text-input
  display: block
  background: transparent
  margin: 0
  border-top: none
  border-left: none
  border-right: none
  border-bottom: 1px solid $trans-grey
  font-size: 1.0em
  padding: 1.0em 0
  width: 100%
  outline: none
  box-sizing: border-box
  resize: none
  +
    label
      left: 0
      position: absolute
      z-index: -1
      font-size: 1.0em
      transition: all $easeOutQuart-400
      width: 100%
      text-align: left
      top: 1.6em
      bottom: 0
      color: $media-grey
      font-weight: bolder
      box-sizing: border-box
      &:after
        transition: all $easeOutQuart-600
        position: absolute
        content: ''
        bottom: 0
        background-color: transparent
        height: 2px
        width: 0
        left: 50%
        opacity: 0
  &.active
    & +
      label
        color: $brown
        top: 0
        font-size: 0.8em
        &:after
          opacity: 1
          left: 0
          width: 100%
          background-color: $brown
```

and the button ripple effect:
```SASS
.button-ripple
  position: relative
  overflow: hidden
  border: none
  width: 180px
  height : 34px
  color : $red
  transition: background-color $easeOutQuart-400
  &:hover
    cursor: pointer
  background: none
  font-size: 1.2em
  &:focus
    outline: 0
  &:focus
    cursor: pointer
    &:after
      visibility: visible
      animation: ripple 1s ease-out
  &:after
    content: ''
    display: block
    position: absolute
    left: 50%
    top: 50%
    width: 200px
    height: 200px
    margin-left: -100px
    margin-top: -100px
    background-color: $red-trans
    border-radius: 100%
    opacity: 1
    transform: scale(0)
    visibility: hidden
```

```SASS
@keyframes ripple
  0%
    transform: scale(0)
  30%
    transform: scale(1)
  100%
    opacity: 0
    transform: scale(1)
```

Screen shot
-----------

**For desktop**

![alt text](images/desktop-blur.png "Desktop")

![alt text](images/desktop-hover.png "Desktop auto-complete")

![alt text](images/share-search-result.png "Desktop share search result")

![alt text](images/admin.png "Desktop admin panel")

![alt text](images/add-movie.png "Desktop add movie")

**For mobile**

![alt text](images/mobile-blur.png "Mobile")

![alt text](images/mobile-hover.png "Mobile auto-complete")