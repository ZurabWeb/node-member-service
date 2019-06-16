const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const users = require('./app/users');

app.use(bodyParser.json({ strict: false }));

// Generate a random user
app.get('/users/generate', function (req, res) {
	users.random()
		.then((result) => res.json(result))
		.catch((error) => res.status(404).json({ error: error }));
});

// Get a users by user ID
app.get('/users/:id', function (req, res) {
	users.getById(req.params.id)
		.then((result) => res.json(result))
		.catch((error) => res.status(404).json({ error: error }));
});

// Create a new user
app.post('/users', function (req, res) {
	users.save({ name: req.body.name })
		.then((result) => res.status(201).json(result))
		.catch((error) => res.status(400).json({ error: error }));
});

// Update a user
app.put('/users/:id', function (req, res) {
	users.save(Object.assign(req.body, { id: req.params.id }))
		.then(() => res.status(204).send())
		.catch((error) => res.status(400).json({ error: error }));
});

// Delete a user
app.delete('/users/:id', function (req, res) {
	users.deleteById(req.params.id)
		.then(() => res.status(204).send())
		.catch((error) => res.status(400).json({ error: error }));
});

module.exports.handler = serverless(app);