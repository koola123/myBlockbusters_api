const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');

const app = express();

app.use(bodyParser.json());


app.use(morgan('common'));


let myMovies = [
    {
        title: 'Star Wars: Episode I - The Phantom Menace',
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: Episode II - Attack of the Clones',
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: Episode III - Revenge of the Sith',
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: Episode IV - A new Hope',
        director: 'George Lucas'
    },
    {
        title: 'Star Wars: Episode V - The Empire Strikes Back',
        director: 'Irvin Kershner'
    },
    {
        title: 'Star Wars:  Episode VI - Return of the Jedi ',
        director: 'Richard Marquand'
    },
    {
        title: 'Star Wars: Epside VII - The Force Awakens',
        director: 'J. J. Abrams'
    },
    {
        title: 'Star Wars: Episode VIII - The Last Jedi',
        director: 'Rian Johnson'
    },
    {
        title: 'Star Wars IX - The Rise of Skywalker',
        director: 'J. J. Abrams'
    },
    { 
        title: 'Rogue One: A Star Wars Story',
        director: 'Gareth Edwards'
    },
  ];

// GET all movies
app.get('/movies', (req, res) => {
    res.json(myMovies);
});

app.use('/public', express.static(__dirname + '/public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});

