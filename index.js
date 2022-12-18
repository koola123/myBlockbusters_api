const e = require('express');
const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');

const app = express();

app.use(bodyParser.json());


app.use(morgan('common'));


let myMovies = [
    {
        title: 'The Phantom Menace',
        director: 'George Lucas'
    },
    {
        title: 'Attack of the Clones',
        director: 'George Lucas'
    },
    {
        title: 'Revenge of the Sith',
        director: 'George Lucas'
    },
    {
        title: 'A new Hope',
        director: 'George Lucas'
    },
    {
        title: 'The Empire Strikes Back',
        director: 'Irvin Kershner'
    },
    {
        title: 'Return of the Jedi ',
        director: 'Richard Marquand'
    },
    {
        title: 'The Force Awakens',
        director: 'J. J. Abrams'
    },
    {
        title: 'The Last Jedi',
        director: 'Rian Johnson'
    },
    {
        title: 'The Rise of Skywalker',
        director: 'J. J. Abrams'
    },
    {
        title: 'Rogue One',
        director: 'Gareth Edwards'
    },
  ];

// Return a list of ALL movies
app.get('/movies', (req, res) => {
    res.json(myMovies);
});

// Gets data about a single movie by title
app.get('/movies/:title', (req, res) => {
    res.json(myMovies.find((movie) => {
        return movie.title === req.params.title}));
});

// Gets data about a genre by title
app.get('/movies/genres/:title', (req, res) => {
    res.json(myMovies.find((movie) => {
        return movie.title === req.params.title}));
});


// Get data about a director
app.get('/directors/:name', (req, res) => {
    res.json(myMovies.find((movie) => {
        return movie.director.name === req.params.name;
    }));
});

// Register new user
app.post('/users', (req, res) => {

});

// Update user information
app.put('/users/:user', (req, res) => {

});

// Add movie to user favorites
app.post('/users/:favorites/movies/:movie/', (req, res) => {
    let newMovie = req.body;

    if (!newMovie.title) {
        const message = 'Missing title in request body';
        res.status(404).send(message);
    } else {
        newMovie.id = uuid.v4();
        myMovies.push(newMovie);
        res.status(201).send(newMovie);
    }
});

// Remove movie from user favorites
app.delete('/users/movies/:movie/title', (req, res) => {

});

// Deregister exisiting user
app.post('users/:deregister', (req, res) => {

});

// Serve static files
app.use('/public', express.static(__dirname + '/public'));


// Handling errors in middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});
