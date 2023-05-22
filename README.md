# MyFlix API

## Description
A REST API for an application called “myFlix” that interacts with a database that stores data about different movies.

This is a he server-side component of a “movies” web application. The web application will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favorite movies.

The main purpose of this app is to present how I create a REST API architecture.

This site was built using [Heroku GitHub Deploys](https://devcenter.heroku.com/articles/github-integration).

<br>

<strong>[Link to Documentation](https://my-blockbusters.herokuapp.com/documentation)</strong>

<br>

## Key Features
- Express library for endpoint routing
- Uses MongoDB noSQL database deployed on MongoDB Atlas
- Basic HTTP auth for first login then JWT (token-based) authentication for further API calls.
- User's password hashing

## Getting started

### Prerequisites

Install nodejs LTS or the latest version.

Setup a mongodb database. 

<br>

## Installation

<br>

Clone the repository:

```
git clone https://github.com/koola123/myFlix-API.git
cd myflix-api
npm install
```

then run the app with `node index.js`

Create a file and name it <i>.env.development.local</i> for environment variables and add the next content:

````
CONNECTION_URI="your mongo DB connection string"
PORT=your port number
HOST="your host name with the used http protocol together"
JWT_SECRET="your super secret code"
````
Then run the following commands:

npm install
npm run start

<br>

## Testing

The endpoints can be tested directly from the [documentation](https://my-blockbusters.herokuapp.com/documentation) or tested via Postman.

<br>

## Dependencies

See <i>package.json</i>.

<br>

Version 1.0.0













