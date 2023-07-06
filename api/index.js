const keys = require('./keys');

// Express App Setup
const express = require('express');
const cors = require('cors');

const app = express();

// Cross Origin Resource Sharing
app.use(cors());

// Body Parser Middleware
app.use(express.json());

// Postgres Client Setup
const { Pool } = require('pg');

// Create a new pool

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

// Error handling
pgClient.on('error', () => console.log('Lost PG connection'));

// Create a table called values with a single column called number
pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = require('redis');

// Create a new redis client

const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});
const redisPublisher = redisClient.duplicate();

redisClient.on('error', (err) => console.log(err));
redisPublisher.on('error', (err) => console.log(err));

redisClient.on('connect', () => console.log('Client connected to Redis'));
redisPublisher.on('connect', () => console.log('Publisher connected to Redis'));

const startUp = async () => {
  console.log('Starting up');
  console.log('Connecting to Postgres');
  console.log(keys.pgHost);
  console.log(keys.pgPort);
  console.log('Connecting to Redis');
  console.log(keys.redisHost);
  console.log(keys.redisPort);
  await pgClient.connect();

  await redisClient.connect();
  await redisPublisher.connect();
};

// Express route handlers

// Test route
app.get('/', (req, res) => {
  res.send('Hi');
});

// Get all values from Postgres
app.get('/values/all', async (req, res) => {
  // Get all rows from table values
  console.log('Getting all values');
  const values = await pgClient.query('SELECT * from values');

  // Return only the rows
  res.send(values.rows);
});

// Get all values from Redis
app.get('/values/current', async (req, res) => {
  console.log('Getting current values');
  // Get all values from Redis
  const values = await redisClient.HGETALL('values');
  res.send(values);
});

// Post a new value
app.post('/values', async (req, res) => {
  // Get the index from the request body
  console.log('Posting new value');
  const index = req.body.index;

  // If the index is greater than 40, return an error
  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  // Set the value of index to 'Nothing yet!'
  await redisClient.HSET('values', index, 'Nothing yet!');

  // Publish a new insert event
  console.log('Publishing new insert event');
  await redisPublisher.publish('insert', index);

  // Insert the index into the table values
  await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  // Return a status of 200
  res.send({ working: true });
});

startUp().then(
  app.listen(5000, (err) => {
    console.log('Listening');
  })
);
