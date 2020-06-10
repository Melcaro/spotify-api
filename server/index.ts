import express from 'express';
import http from 'http';
//const http = require('http');
require('dotenv').config();
import { middlewares } from './middlewares';
import { routes } from './routes';

// http
//   .createServer(function (request, response) {
//     response.writeHead(200, { 'Content-Type': 'text/plain' });
//     response.write('Hello World');
//     response.end();
//   })
//   .listen(8888);

const app = express();

middlewares(app);
routes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
