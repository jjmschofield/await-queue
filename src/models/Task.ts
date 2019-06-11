import Deferred from './Deferred';

export interface TaskConfig {
  deferred: Deferred;
  awaitable(input: any): Promise<any>;
  input: any;
}

export type Awaitable = (input: any) => Promise<any>;

export class Task {
  deferred: { resolve: Function, reject: Function };
  input: any;
  errors: Error[];

  constructor(task: TaskConfig) {
    this.deferred = task.deferred;
    this.input = task.input;
    this.errors = [];
    if (task.awaitable) this.awaitable = task.awaitable;
  }

  async awaitable(input: any): Promise<any> {
    throw new Error('Task does not implement an awaitable function');
  }
}

export default Task;
