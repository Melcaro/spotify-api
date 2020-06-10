import express from 'express';

export function middlewares(app) {
  app.use(express.json());
}
