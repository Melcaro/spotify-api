import express from 'express';
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
require('dotenv').config();
import { middlewares } from './middlewares';
import { routes } from './routes';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:5000/login'; // Your redirect uri localhost:5000

const app = express();

console.log('toto', client_id);

// USING APP.JS IN PUBLIC

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length: number) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey: string = 'spotify_auth_state';

app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-private user-read-email';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };

    request.post(authOptions, function (error: any, response: any, body: any) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error: any, response: any, body: any) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          '/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          '/#' +
            querystring.stringify({
              error: 'invalid_token',
            })
        );
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error: any, response: any, body: any) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

// USING APP.JS IN CLIENT_CREDENTIALS
// app.get('/login', function (req: any, res: any) {
//   const authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       Authorization:
//         'Basic ' +
//         new Buffer(client_id + ':' + client_secret).toString('base64'),
//     },
//     form: {
//       grant_type: 'client_credentials',
//     },
//     json: true,
//   };

//   request.post(authOptions, function (error: any, response: any, body: any) {
//     if (!error && response.statusCode === 200) {
//       // use the access token to access the Spotify Web API
//       const token = body.access_token;
//       const options = {
//         url: 'https://api.spotify.com/v1/users/2cb4bnosjdoy4faxpt9en0u2h',
//         headers: {
//           Authorization: 'Bearer ' + token,
//         },
//         json: true,
//       };
//       request.get(options, function (error: any, response: any, body: any) {
//         console.log(body);
//       });
//     }
//   });
// });

middlewares(app);
routes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
