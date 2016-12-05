var header,
    searchInput,
    resultBox,
    blackCover,
    submitButton,
    searchForm,
    scrollButton,
    doneButton,
    shareResultButton,
    shareResultDialog,
    newMovieButton,
    newMovieDialog,
    shareResultDialogContent,
    shareResultDialogInput,
    shareResultDialogButton,
    contentContainer,
    posterFileInput,
    posterImage,
    submitNewMovieButton,
    newMovieForm,
    movieList;


window.onload = function () {

    header = document.querySelector('header');
    searchInput = document.querySelector('.search-field>input');
    resultBox = document.querySelector('.search-result');
    blackCover = document.querySelector('#black-cover');
    submitButton = document.querySelector('#submit-button');
    searchForm = document.querySelector('#search-form');
    scrollButton = document.querySelector('#scroll-up-button');
    shareResultButton = document.querySelector('#share-result-button');
    doneButton = document.querySelector('#done-button');
    shareResultDialog = document.querySelector('#share-result-dialog');
    posterFileInput = document.querySelector('#' + CSS.escape('movie[poster]'));
    posterImage = document.querySelector('.image-box>img');
    newMovieButton = document.querySelector('.add-movie-button');
    newMovieDialog = document.querySelector('#new-movie-dialog');
    submitNewMovieButton = document.querySelector('#submit-new-movie-btn');
    newMovieForm = document.querySelector('#new-movie-form');
    movieList = document.querySelector('#movie-list');

    pullMovieList();

    if (submitNewMovieButton) {
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
    }

    if (newMovieButton) {
        newMovieButton.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            showBlackCover();
            addClass(newMovieDialog, 'active');
        });
    }

    if (shareResultDialog) {
        shareResultDialogInput = shareResultDialog.querySelector('input');
        shareResultDialogButton = shareResultDialog.querySelector('button');
        shareResultDialogContent = shareResultDialog.querySelector('.content');
    }
    contentContainer = document.querySelector('#content');

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

    if (searchInput) {

        searchInput.addEventListener('focus', function () {
            addClass(header, 'active');
            addClass(resultBox, 'active');
            addClass(doneButton, 'active');
            resultBox.style.marginTop = '0px';
            showBlackCover();
            this.setSelectionRange(0, this.value.length);
            sendSearchRequestAutoComplete(searchInput.value);
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key == 'Escape') {
                blackCover.click();
                sendSearchRequest('');
            } else if (e.key == 'Enter')
                sendSearchRequest(e.target.value);
        });

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
    }

    if (submitButton)
        submitButton.addEventListener('click', function () {
            sendSearchRequest(document.querySelector('.search-field input[name=q]').value);
        });

    window.onscroll = function () {
        if (scrollButton) {
            if (document.body.scrollTop > 0)
                addClass(scrollButton, 'active');
            else
                removeClass(scrollButton, 'active');
        }

    };

    if (shareResultButton)
        addClass(shareResultButton, 'active');

    if (shareResultDialogButton)
        shareResultDialogButton.addEventListener('click', function () {
            shareResultDialogInput.focus();
            shareResultDialogInput.select();
            document.execCommand('copy');
            removeClass(shareResultDialog, 'active');
            hideBlackCover();
            addClass(shareResultButton, 'active');
        });

    if (doneButton)
        doneButton.addEventListener('click', function () {
            blackCover.click();
        });

    document.querySelectorAll('.text-input').forEach(addMaterialLabel);

    if (posterFileInput)
        posterFileInput.onchange = function () {
            var reader = new FileReader();
            reader.onload = function (e) {
                addClass(posterImage.parentNode, 'active');
                posterImage.src = e.target.result;
            };

            reader.readAsDataURL(this.files[0]);
        };

    var path = window.location.pathname;
    if (path == '/search') {
        var query = window.location.search.substring(1);
        var params = {};

        query.split('&').forEach(function (keyValue) {
            var kv = keyValue.split('=');
            params[kv[0]] = decodeURI(kv[1]);
        });

        if (params['q']) {
            searchInput.value = params['q'];
            submitButton.click();
        }
    }
};

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

function pullMovieList() {
    ajax('movies', 'GET')
        .then(function (data) {
            movieList.innerHTML = '';
            var movies = JSON.parse(data);
            Object.keys(movies).forEach(function (k) {
                addMovie(movies[k]);
            });
        });
}

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

function getEditable(inputType, value) {
    var input = document.createElement(inputType);
    input.value = value;
    return input;
}

function addMaterialLabel(input) {
    input.addEventListener('focus', function () {
        addClass(input, 'active');
    });

    input.addEventListener('blur', function () {
        if (input.value.length <= 0) removeClass(input, 'active');
    });
}

function findParent(dom, selector) {
    var parent = dom;
    var last = null;
    while (!parent.querySelector(selector)) {
        last = parent;
        parent = parent.parentNode;
    }
    return last;
}

function showBlackCover() {
    blackCover.style.display = 'block';
    blackCover.style.height = Math.max(document.documentElement.offsetHeight, window.innerHeight) + 'px';
}

function hideBlackCover() {
    blackCover.style.height = '0px';
    blackCover.style.display = 'none';
}

function updateAutoComplete(query, results) {
    var resultBox = document.querySelector('.search-result');
    resultBox.innerHTML = '';
    if (results.length > 0) {
        results.forEach(function (r) {
            var li = document.createElement('li');
            li.innerHTML = r.replace(new RegExp('(' + query + ')', 'ig'), '<span>$1</span>');
            resultBox.appendChild(li);
            li.dataset['name'] = r;
            li.addEventListener('click', function (e) {
                searchInput.value = e.target.dataset['name'];
                getMovie(e.target.dataset['name']);
                blackCover.click();
            });
        });
    }
}

function updateContents(r) {
    var resultBox = document.querySelector('#content>ul');
    resultBox.innerHTML = '';
    Object.keys(r).forEach(function (movieName) {
        addMovie(r[movieName]);
    });
}

function updateContent(r) {
    var resultBox = document.querySelector('#content>ul');
    resultBox.innerHTML = '';
    var li = document.createElement('li');
    li.className = 'movie';
    li.innerHTML = getResultContent(r);
    resultBox.appendChild(li);
}

function sendSearchRequestAutoComplete(query) {
    ajax('/search?q=' + encodeURI(query), 'GET', null, 'application/json/keys')
        .then(function (data) {
            var results = JSON.parse(data);
            updateAutoComplete(query, results);
        });
}

function sendSearchRequest(query) {
    ajax('/search?q=' + encodeURI(query), 'GET', null, 'application/json')
        .then(function (data) {
            if (data != "") {
                var result = JSON.parse(data);
                updateContents(result);
                blackCover.click();
            }
        });
}

function getMovie(query) {
    ajax('/movies/' + encodeURI(query), 'GET', null, 'application/json')
        .then(function (data) {
            if (data != "") {
                var result = JSON.parse(data);
                updateContent(result);
            }
        });
}

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
            else fail(req.responseText);
        });
        req.addEventListener("error", function () {
            fail(new Error("Network error"));
        });
        req.setRequestHeader('Accept', format);
        req.send(data);
    });
}

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

function transition(obj) {
    var target = obj['target'];
    var property = obj['property'];
    var startVal = obj['from'];
    var endVal = obj['to'];
    var duration = obj['duration'];
    var curr = startVal;


    var step = (endVal - startVal) / duration * 10;
    var timer = window.setInterval(function () {
        curr += step;
        target[property] = curr;
        if (step > 0 && curr >= endVal) window.clearInterval(timer);
        else if (step < 0 && curr <= endVal) window.clearInterval(timer);
    }, 10);
}