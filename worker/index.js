const key = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  url: `redis://${key.redisHost}:${key.redisPort}`,
});

const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

const startUp = async () => {
  redisClient.on('error', (err) => console.log(err));
  sub.on('error', (err) => console.log(err));

  redisClient.on('connect', () => console.log('Client connected to Redis'));
  sub.on('connect', () => console.log('Subscriber connected to Redis'));

  const listener = async (message, channel) => {
    console.log(`Received ${message} from ${channel}`);
    await redisClient.HSET('values', message, fib(parseInt(message)));
  };

  sub.subscribe('insert', listener);

  await redisClient.connect();
  await sub.connect();
};

startUp().then(() => console.log('Worker started'));
