// tslint:disable:variable-name // We disable this rule as we clearly want to mark privates
import Task, { Awaitable } from './models/Task';
import Deferred from './models/Deferred';

export class Queue {
  private readonly _queue: Task[];
  private _isPolling: boolean;
  private readonly _maxRetry: number;
  private readonly _mode: QUEUE_MODE;
  private readonly _concurrency: number;
  private readonly _counters: QueueCounters;

  constructor({ maxRetry = 3, mode = QUEUE_MODE.FIFO, concurrency = 1 }: QueueConfig = {}) {
    this._queue = [];
    this._isPolling = false;
    this._mode = mode;
    this._maxRetry = maxRetry;
    this._concurrency = concurrency;
    this._counters = {
      running: 0,
      success: 0,
      errors: 0,
      retries: 0,
    };
  }

  start() {
    this._isPolling = true;
    this._poll();
  }

  stop() {
    this._isPolling = false;
  }

  async add(awaitable: Awaitable, input: any, autoStart = true) {
    let deferred = new Deferred();

    const promise = new Promise((resolve, reject) => { // Yes, this is very weird. We create a promise and return it - but leave the resolve and reject available for the _queue to control!
      deferred = new Deferred({ resolve, reject });
    });

    const task = new Task({
      deferred,
      awaitable,
      input,
    });

    this._enqueueTask(task);

    if (!this._isPolling && autoStart) this.start();

    return promise;
  }

  hasTasks(): boolean {
    return this._queue.length > 0 || this._counters.running > 0;
  }

  stats(): QueueCounters {
    return Object.assign({}, this._counters, { size: this._queue.length });
  }

  private async _poll() {
    const tasks = this._popBatch(this._concurrency - this._counters.running);

    tasks.forEach((task) => {
      this._processTask(task);
    });

    if (this.hasTasks() && this._isPolling) {
      setImmediate(() => this._poll());
    } else {
      this.stop();
      return this.stats();
    }
  }

  private async _processTask(task: Task) {
    try {
      this._counters.running += 1;

      const result = await task.awaitable(task.input);

      this._counters.success += 1;

      task.deferred.resolve(result);
    } catch (error) {
      task.errors.push(error);

      if (task.errors.length - 1 < this._maxRetry) {
        this._counters.retries += 1;
        this._queue.push(task);
      } else {
        this._counters.errors += 1;
        task.deferred.reject(error);
      }
    } finally {
      this._counters.running -= 1;
    }
  }

  private _enqueueTask(task: Task) {
    switch (this._mode) {
      case QUEUE_MODE.FIFO:
        return this._queue.unshift(task);
      case QUEUE_MODE.LIFO:
        return this._queue.push(task);
      default:
        return this._queue.unshift(task);
    }
  }

  private _popBatch(batchSize: number): Task[] {
    const batch: Task[] = [];

    for (let i = 0; i < batchSize && this._queue.length > 0; i += 1) {
      const task = this._queue.pop();
      // @ts-ignore
      batch.push(task); // it is not possible for task to be undefined due to this._queue.length > 0; ts can't see this
    }

    return batch;
  }
}

export enum QUEUE_MODE {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
}

export type QueueCounters = { running: number; retries: number; success: number; errors: number; };

export type QueueConfig = { maxRetry?: number, mode?: QUEUE_MODE, concurrency?: number };

export default Queue;
