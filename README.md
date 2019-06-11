# await-queue
[![CircleCI](https://circleci.com/gh/jjmschofield/await-queue.svg?style=shield)](https://circleci.com/gh/jjmschofield/await-queue) [![Coverage Status](https://coveralls.io/repos/github/jjmschofield/await-queue/badge.svg?branch=master)](https://coveralls.io/github/jjmschofield/await-queue?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/jjmschofield/node-typescript-starter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jjmschofield/await-queue?targetFile=package.json)

A simple awaited queue for NodeJs. 

Designed to make managing concurrency limiting a breeze using tidy async/await syntax.

## Installation
```
$ npm install @jjmschofield/await-queue
```

## Usage
```
// Import the module
const { Queue } = require('@jjmschofield/await-queue');

const someQueableThing = async () =>{
    // Create a queue
    const queue = new Queue();
    
    // Await your task
    const result = await queue.add(someAsyncTask, { prop: 'value' });
    
    // Profit
}


```

Your async task can be any awaitable thing, it should take an object of inputs as it's first parameter eg:
```
const someAsyncTask = async ({ a, b }) =>{
    return { a, b };
}
```
As you can imagine, you can add virtually any function in which returns a promise, the world is your oyster!

## Config
What is a handy library without some config options? Here are yours:

```
const { Queue, QUEUE_MODE } = require('<path to file>');

const queue = new Queue({ 
    maxRetry: 3, // Number of times to retry a thing before returning the final error recieved
    mode: QUEUE_MODE.FIFO, // Can be 'FIFO' or 'LIFO'
    concurrency: 1, // How many tasks do you want to run at once?
}); 
```


