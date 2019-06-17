'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;
const uuidv4 = require('uuid/v4');
const User = require('../entity/user');
const generatorSource = 'https://randomuser.me/api';

const getById = (id) => {
	const params = {
		TableName: USERS_TABLE,
		Key: {
			id: id,
		},
	}

	return new Promise(function(resolve, reject) {
		dynamoDb.get(params, (error, result) => {
			if (error || result.Item == undefined) {
				console.log(error || 'User not found by ID: ' + params.Key.id);
				return reject('User not found');
			}
			return resolve(new User(result.Item.id, result.Item.name));
		});
	});
}

// Used for both create and update
const save = (data) => {
	const params = {
		TableName: USERS_TABLE,
		Item: {
			id: data.id || uuidv4(),
			name: data.name,
		},
	};

	return new Promise(function(resolve, reject) {
		if (typeof params.Item.name !== 'string') {
			return reject('"name" must be a string');
		}
	
		dynamoDb.put(params, (error) => {
			if (error) {
				console.log(error);
				return reject('Could not save user');
			}
			return resolve(new User(params.Item.id, params.Item.name));
		});
	});
}

const deleteById = (id) => {
	const params = {
		TableName: USERS_TABLE,
		Key: {
			id: id,
		},
	};

	return new Promise(function(resolve, reject) {
		dynamoDb.delete(params, (error) => {
			if (error) {
				console.log(error);
				return reject('Could not delete user');
			}
			return resolve('ok');
		});
	});
}

async function saveAsync(data) {
	return await save(data);
}

// Get a random user asynchronously
const random = () => {
	return new Promise(function(resolve, reject) {
		require('request')({
			url: generatorSource,
			json: true
		}, function (error, response, body) {
			if (error || response.statusCode !== 200) {
				return reject('Could not get a random user');
			}

			let user = body.results[0];
			let userData = { name: user.name.first + ' ' + user.name.last };
			resolve(saveAsync(userData))
		})
	});
}

module.exports = {
	getById: getById,
	save: save,
	deleteById: deleteById,
	random: random
};