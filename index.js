const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');
const {check, validationResult} = require('express-validator');

// Require Mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
// mongoose.connect('mongodb://localhost:27017/myMovies', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080','http://testsite.com',
'http://localhost:1234', 'https://my-blockbusters.herokuapp.com/',
'http://localhost:4200', 'https://myflix-movies-client.netlify.app/','https://koola123.github.io'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
app.use(morgan('common'));


// RETURN STARTPAGE::
app.get('/', (req,res) => {
  res.send('Star Wars Blockbusters for Everyone!');
})

// GET DOCUMENTATION::
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
})

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
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
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
app.put('/users/:Username',
[
  check('Username', 'Username is required').isLength({min: 5}), // minimum length of username is 5 char
  check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(), // password input must not be empty
  check('Email', 'Email does not appear to be valid').isEmail()
],
passport.authenticate('jwt', {session: false}), (req, res) => {
  let errors = validationResult(req);
      if (!errors.isEmpty()){ //if errors is not empty (if there are arreors--->)
          return res.status(422).json({errors: errors.array()}) //if errors in validation occur then send back to client in an array
      }
  console.log(Users)
      // if error occurs rest of the code will not be executed
  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then(( updatedUser) => {
      res.json(updatedUser);
  })
  .catch( (err)=> {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } );
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
