# await-queue
A simple awaited queue for NodeJs. 

Designed to make managing concurrency limiting a breeze using tidy async/await syntax.

## Installation
Right now just copy the contents of index.ts into whatever you need.

## Usage
```
// Import the module
const { Queue } = require('<path to file>');

const someQueableThing = async () =>{
    // Create a queue
    const queue = new Queue();
    
    // Await your task
    const result = await queue.add(someAsyncTask, {prop: 'value'});
    
    // Profit
}


```
You async task can be any awaitable thing, it should take an object of inputs as it's first parameter eg:
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


