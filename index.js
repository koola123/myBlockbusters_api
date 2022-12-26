const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');

// Require Mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myMovies', { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
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

// RETURN ALL MOVIES::
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// RETURN A SINGLE MOVIE BY TITLE::
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((error) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

// RETURN DATA ABOUT A MOVIE BY GENRE AND NAME::
app.get('/movies/genres/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"Genre.Name": req.params.Name})
  .then((movie) => {
    res.status(200).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

// RETURN DATA ABOUT A MOVIE DIRECTOR BY NAME::
app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name})
    .then((movie) => {
      res.status(200).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
});

// REGISTER OR ADD A NEW USER
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => {res.status(201).json(user ) })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error:' + err);
      })
    }
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
  });
});

//GET ALL USERS::
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
  .then((users) => {
    res.status(200).json(users);
  })
  .catch((err) => {
    console.log(err);
    res.status(501).send('Error' + err);
  });
});


//GET A USER BY USERNAME::
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

// UPDATE USER INFORMATION::
// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
  { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
  }
},
{ new: true }, // This line makes sure that the updated document is returned
(err, updatedUser) => {
  if (err) {
    console.log(err);
    res.status(500).send('Error:' + err);
  } else {
    res.status(201).json(updatedUser);
  }
});
});

// Add movie to user favorites
// app.post('/users/:favorites/movies/:movie/', (req, res) => {
//     let newMovie = req.body;
//
//     if (!newMovie.title) {
//         const message = 'Missing title in request body';
//         res.status(404).send(message);
//     } else {
//         newMovie.id = uuid.v4();
//         myMovies.push(newMovie);
//         res.status(201).send(newMovie);
//     }
// });


// ADD A MOVIE TO A USER'S LIST OF FAVORITES::
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $addToSet: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//REMOVE A MOVIE TO USER'S LIST OF FAVORITES::
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// DELETE A USER BY USERNAME::
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
