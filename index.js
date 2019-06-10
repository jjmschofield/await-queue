const QUEUE_MODE = {
    FIFO: 'FIFO',
    LIFO: 'LIFO',
};

class Queue {
    /**
     *
     * @param {number} maxRetry
     * @param {string} mode
     * @param {number} concurrency
     */
    constructor({ maxRetry = 3, mode = QUEUE_MODE.FIFO, concurrency = 1 } = {}) {
        this._queue = [];
        this.isPolling = false;
        this.mode = mode;
        this.maxRetry = maxRetry;
        this.concurrency = concurrency;
        this.counters = {
            running: 0,
            success: 0,
            errors: 0,
            retries: 0,
        };
    }

    /**
     *
     */
    start() {
        this.isPolling = true;
        this.poll();
    }

    /**
     *
     */
    stop() {
        this.isPolling = false;
    }

    /**
     *
     * @returns {Promise<*>}
     */
    async poll() {
        const tasks = extractBatch(this._queue, this.concurrency - this.counters.running);

        tasks.forEach((task) => {
            this.processTask(task);
        });

        if (this.hasTasks() && this.isPolling) {
            setImmediate(() => this.poll());
        } else {
            this.stop();
            return this.stats();
        }
    }

    /**
     *
     * @param {Function} awaitable
     * @param {Object} input
     * @param {boolean} autoStart
     * @returns {Promise<*>}
     */
    async add(awaitable, input, autoStart = true) {
        const task = {
            deferred: null,
            awaitable,
            input,
            errors: [],
        };

        queueOperationByMode(this._queue, this.mode, task);

        if (!this.isPolling && autoStart) this.start();

        return new Promise((resolve, reject) => { // Yes, this is very weird. We create a promise and return it - but leave the resolve and reject available for the _queue to control!
            task.deferred = { resolve, reject };
        });
    }

    /**
     * @param task
     * @returns {Promise<void>}
     */
    async processTask(task) {
        try {
            this.counters.running += 1;

            const result = await task.awaitable(task.input);

            this.counters.success += 1;

            task.deferred.resolve(result);
        }
        catch (error) {
            task.errors.push(error);

            if (task.errors.length - 1 < this.maxRetry) {
                this.counters.retries += 1;
                this._queue.push(task);
            } else {
                this.counters.errors += 1;
                task.deferred.reject(error);
            }
        } finally {
            this.counters.running -= 1;
        }
    }

    hasTasks() {
        return this._queue.length > 0 || this.counters.running;
    }

    stats() {
        return Object.assign({}, this.counters, { size: this._queue.length });
    }
}

const queueOperationByMode = (queue, mode, task) => {
    switch (mode) {
        case QUEUE_MODE.FIFO:
            return queue.push(task);
        case QUEUE_MODE.LIFO:
            return queue.unshift(task);
        default:
            return queue.push(task);
    }
};

const extractBatch = (arr, batchSize) => {
    const batch = [];

    for (let i = 0; i < batchSize && arr.length > 0; i += 1) {
        batch.push(arr.pop());
    }
    return batch;
};


module.exports = {
    Queue,
    QUEUE_MODE,
};