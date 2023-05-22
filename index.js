const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");
const { check, validationResult } = require("express-validator");

// Require Mongoose
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

/*mongoose.connect("mongodb://localhost:27017/myMovies", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://my-blockbusters.herokuapp.com/",
  "http://localhost:4200",
  "https://myflix-movies-client.netlify.app",
  "https://koola123.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");
app.use(morgan("common"));

/**
 * WELCOME PAGE
 * @description - Welcome page
 * @param {URL} - /
 * @param {HTTP} - GET
 * @param {Query_Parameters} - none
 * @param {Request_Body} - none
 * @param {Response} - none
 * @returns {string} - Welcome message
 */

app.get("/", (req, res) => {
  res.send("Welcome to my Star Wars blockbusters!");
});

/**
 * GET THE DOCUMENTATION
 * @function get
 * @returns {string}
 */

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

/**
 * GET A LIST OF ALL MOVIES
 * @description - Get a list of all movies
 * @param {URL} - /movies
 * @param {HTTP} - GET
 * @param {Query_Parameters} - none
 * @param {Request_Body} - none
 * @param {Response} - array(JSON)
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {array(JSON)} - An array with a list with all the movies in the database
 */

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET ALL THE INFORMATION OF THE SPECIFIED MOVIE
 * @description - Get all the information of the specified movie
 * @param {URL} - /movies/:Title
 * @param {HTTP} - GET
 * @param {Query_Parameters} - :Title
 * @param {Request_Body} - none
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 * "Genre": {
 * "Name": "Science Fiction",
 * "Description": "Science Fiction (or sci-fi) is a film genre that uses speculative,
 * fictional science-based depictions of phenomena that are not fully accepted by mainstream science,
 * such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, interstellar travel, time travel,
 * or other technologies."
 * },
 * "Director": {
 * "Name": "George Lucas",
 * "Bio": "George Lucas, Jr. (Modesto, California, May 14, 1944) is an American filmmaker, creator of
 *  the film sagas of Star Wars and Indiana Jones, and former president of Lucasfilm Limited, LucasArts
 *  Entertainment Company, Lucas Digital Ltd, Lucas Licensing, LucasBooks and Lucas Learning Ltd. It was considered,
 *  for two consecutive years, the fourth most powerful person in the entertainment industry, behind the owners of Time Warner,
 * Turner and Steven Spielberg.",
 * "Birth": "1944"
 * },
 * "_id": "639f51ebccc4f8b0d39af778",
 * "Title": "Episode I - The Phantom Menace",
 * "Description": "Two brave Jedi escape a hostile blockade to find allies and come across a young boy who may bring balance to the Force,
 *  but the long dormant Sith resurface to claim their original glory.",
 * "ImagePath": "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg",
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with all the information for the specified movie
 */

app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((error) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * GET THE INFORMATION ABOUT A SPECIFIC GENRE
 * @description - Get the information about a specific genre
 * @param {URL} - /movies/genres/:Name
 * @param {HTTP} - GET
 * @param {Query_Parameters} - :Name
 * @param {Request_Body} - none
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 * "Name": "Science Fiction",
 * "Description": "Science Fiction (or sci-fi) is a film genre that uses speculative,
 *  fictional science-based depictions of phenomena that are not fully accepted by mainstream 
 * science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, interstellar travel, 
 * time travel, or other technologies."
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the information about the specified genre
 */

app.get(
  "/movies/genres/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET THE INFORMATION ABOUT A SPECIFIC DIRECTOR
 * @description - Get the information about a specific director
 * @param {URL} - /movies/directors/:Name
 * @param {HTTP} - GET
 * @param {Query_Parameters} - :Name
 * @param {Request_Body} - none
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 * "Name": "David Filoni",
 * "Bio": "David Filoni (born June 7, 1974) is an American film and television director, voice actor, 
 * television writer, television producer, and animator. He has worked on Avatar: The Last Airbender, 
 * The Mandalorian, and on the theatrical film and television series of Star Wars: The Clone Wars.",
 * "Birth": "1974"
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the information about the specified director
 */


app.get(
  "/movies/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * ADD A NEW USER
 * @description - Add a new user
 * @param {URL} - /users
 * @param {HTTP} - POST
 * @param {Query_Parameters} - none
 * @param {Request_Body} - JSON object
 * @example
 * // Request data format
 * {
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate": "1990-01-01"
 * }
 * @param {response} - JSON object
 * @example
 * // Response data format
 * {
 *  "user": {
 *    "_id": "asdasd123123123asd",
 *    "Username": "User1",
 *    "Password": "Password1",
 *  	"Email": "user1@email.com",
 *    "Birthdate": "1990-01-01" ,
 *    "FavoriteMovies": []
 *  },
 *  "token": "zxcvbnmmnbvcxz1029384756zxcvbnm"
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the information of the new user
 */

app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
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
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send("Error: " + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET A LIST OF ALL USERS
 * @description - Get a list of all users
 * @param {URL} - /users
 * @param {HTTP} - GET
 * @param {Query_Parameters} - none
 * @param {Request_Body} - none
 * @param {Response} - array(JSON)
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {array(JSON)} - A list with all registered users
 */

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(501).send("Error" + err);
      });
  }
);

/**
 * GET A SPECIFIC USER BY USERNAME
 * @description - Get a specific user by Username
 * @param {URL} - /users/:Username
 * @param {HTTP} - GET
 * @param {Query_Parameters} - :Username
 * @param {Request_Body} - none
 * @param {response} - JSON object
 * @example
 * // Response data format
 * {
 *  "_id": "asdasd123123123asd",
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate": "1990-01-01",
 *  "FavoriteMovies": []
 * }
 * @param {authentication} - Bearer token {JWT}
 * @callback requestCallback
 * @returns {object} - An object with the user's information
 */

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * UPDATE THE LOGGED IN USER'S INFORMATION
 * @description - Update the logged in user's information
 * @param {URL} - /users/:Username
 * @param {HTTP} - PUT
 * @param {Query_Parameters} - :Username
 * @param {Request_Body} - JSON object
 * @example
 * // Request data format
 * {
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate:" "1990-01-01"
 * }
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 *  "_id": "asdasd123123123asd",
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate": "1990-01-01",
 *  "FavoriteMovies": [
 *    "qweqwe456456qwe",
 *    "zxczxc789789zxc,
 *  ]
 * }
 * @param {authentication} - Bearen token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the user's updated information
 */

app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }), // minimum length of username is 5 char
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(), // password input must not be empty
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      //if errors is not empty (if there are arreors--->)
      return res.status(422).json({ errors: errors.array() }); //if errors in validation occur then send back to client in an array
    }
    console.log(Users);
    // if error occurs rest of the code will not be executed
    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * ADD A MOVIE TO THE FAVORITES LIST
 * @description - Add a movie to the favorites list
 * @param {URL} - :Username, :MovieID
 * @param {HTTP} - POST
 * @param {Query_Parameters} - :Username/movies/:MovieID
 * @param {Request_Body} - none
 * @param {Response} - JSON object
 * @example
 * // Response data format
 *{
 *  "_id": "asdasd123123123asd",
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate": "1990-01-01",
 *  "FavoriteMovies": [
 *    "qweqwe456456qwe",
 *   ]
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the user's information adding the new favorited movie
 */

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $addToSet: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE A MOVIE FROM THE FAVORITES LIST
 * @description - Delete a movie from the favorites list
 * @param {URL} - :Username, :MovieID
 * @param {HTTP} - DELETE
 * @param {Query_Parameters} - :Username/movies/:MovieID
 * @param {Request_Body} - none
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 *  "_id": "asdasd123123123asd",
 *  "Username": "User1",
 *  "Password": "Password1",
 *  "Email": "user1@email.com",
 *  "Birthdate": "1990-01-01",
 *  "FavoriteMovies": []
 * }
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {object} - An object with the user's information without the movie just deleted
 */

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE A USER BY USERNAME
 * @description - Delete a user
 * @param {URL} - /users/:Username
 * @param {HTTP} - DELETE
 * @param {Query_Parameters} - :Username
 * @param {Request_Body} - none
 * @param {Response} - none
 * @param {authentication} - Bearer token (JWT)
 * @callback requestCallback
 * @returns {string} - An alert window pops up informing that the user has been deleted
 */

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// SERVE STATIC FILES
app.use("/public", express.static(__dirname + "/public"));

// HANDLING ERRORS IN MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// LISTEN FOR REQUESTS
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
