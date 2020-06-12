import express from 'express';
const request = require('request'); // "Request" library
import http from 'http';
const http = require('http');
require('dotenv').config();
import { middlewares } from './middlewares';
import { routes } from './routes';

http
  .createServer(function (req: any, res: any) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World');
    res.end();
  })
  .listen(8888);

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const app = express();

app.get('/login', function (req:any, res:any) {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'client_credentials',
    },
    json: true,
  };

  req.post(authOptions, function (error: any, response: any, body: any) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      const token = body.access_token;
      const options = {
        url: 'https://api.spotify.com/v1/users/2cb4bnosjdoy4faxpt9en0u2h',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        json: true,
      };
      req.get(options, function (error: any, response: any, body: any) {
        console.log(body);
      });
    }
  });
});

middlewares(app);
routes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
