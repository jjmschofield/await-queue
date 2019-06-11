import Queue, { QUEUE_MODE } from './Queue';
import Task from './models/Task';
import Deferred from './models/Deferred';

describe('src/Queue.ts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('add', () => {
    describe('given the default configuration', () => {
      describe('when given a task which will be successful', () => {
        it('should resolve the deffered promise with the result', async () => {
          // Arrange
          const underTest = new Queue();
          const expectedResult = { someResultProp: 'some result val' };
          const expectedInput = { someInputProp: 'some input val' };
          const expectedAwaitable = jest.fn().mockResolvedValue(expectedResult);

          // Act
          const result = await underTest.add(expectedAwaitable, expectedInput);

          // Assert
          expect(expectedAwaitable).toHaveBeenCalledWith(expectedInput);
          expect(expectedAwaitable).toHaveBeenCalledTimes(1);
          expect(result).toEqual(expectedResult);
        });
      });

      describe('when given a task which will be successful after a retry', () => {
        it('should retry and resolve the deffered promise with the result', async () => {
          // Arrange
          const underTest = new Queue();
          const expectedResult = { someResultProp: 'some result val' };
          const expectedInput = { someInputProp: 'some input val' };
          const expectedAwaitable = jest.fn();

          expectedAwaitable.mockRejectedValueOnce(new Error());
          expectedAwaitable.mockRejectedValueOnce(new Error());
          expectedAwaitable.mockResolvedValue(expectedResult);

          // Act
          const result = await underTest.add(expectedAwaitable, expectedInput);

          // Assert
          expect(expectedAwaitable).toHaveBeenCalledWith(expectedInput);
          expect(expectedAwaitable).toHaveBeenCalledTimes(3);
          expect(result).toEqual(expectedResult);
        });
      });

      describe('when given a task which will never be successful', () => {
        it('should retry 3 times and then return the final error', async () => {
          // Arrange
          const underTest = new Queue();
          const expectedError = new Error('some error');
          const expectedInput = { someInputProp: 'some input val' };
          const expectedAwaitable = jest.fn();

          expectedAwaitable.mockRejectedValueOnce(new Error());
          expectedAwaitable.mockRejectedValueOnce(new Error());
          expectedAwaitable.mockRejectedValueOnce(new Error());
          expectedAwaitable.mockRejectedValueOnce(expectedError);

          // Assert
          await expect(underTest.add(expectedAwaitable, expectedInput)).rejects.toEqual(expectedError);
          expect(expectedAwaitable).toHaveBeenCalledTimes(4);
        });
      });

      describe('when given multiple tasks', () => {
        it('should resolve only one task at a time', async () => {
          // Arrange
          let taskRunning = false;
          const underTest = new Queue();

          const awaitable = async () => {
            expect(taskRunning).toEqual(false);
            taskRunning = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                expect(taskRunning).toEqual(true);
                taskRunning = false;
                expect(taskRunning).toEqual(false);
                resolve();
              }, 10);
            });
          };

          const promises: Promise<any>[] = [];

          // Act
          for (let i = 0; i < 10; i++) {
            promises.push(underTest.add(awaitable, {}));
          }

          // Assert
          await Promise.all(promises);
        });

        it('should resolve tasks in FIFO order', async () => {
          // Arrange
          const underTest = new Queue();

          const awaitable = jest.fn().mockImplementation(async (input: { i: number }) => input.i);

          const promises: Promise<any>[] = [];

          for (let i = 0; i < 3; i++) {
            let deferred = new Deferred();

            const promise = new Promise((resolve, reject) => {
              deferred = new Deferred({ resolve, reject });
            });

            // @ts-ignore
            underTest._enqueueTask(new Task({
              awaitable,
              input: { i },
              deferred,
            }));

            promises.push(promise);
          }

          // Act
          underTest.start();
          await Promise.all(promises);

          // Assert
          expect(awaitable).toHaveBeenNthCalledWith(1, { i: 0 });
          expect(awaitable).toHaveBeenNthCalledWith(2, { i: 1 });
          expect(awaitable).toHaveBeenNthCalledWith(3, { i: 2 });
        });
      });
    });

    describe('when a max retry value is specified in configuration', () => {
      it('should retry a failed task the specified number of times and return the final error', async () => {
        // Arrange
        const expectedNumberOfRetries = 5;
        const underTest = new Queue({ maxRetry: expectedNumberOfRetries });

        const expectedError = new Error('some error');
        const expectedInput = { someInputProp: 'some input val' };
        const expectedAwaitable = jest.fn();

        for (let i = 0; i < expectedNumberOfRetries; i++) {
          expectedAwaitable.mockRejectedValue(new Error());
        }

        expectedAwaitable.mockRejectedValue(expectedError);

        // Assert
        await expect(underTest.add(expectedAwaitable, expectedInput)).rejects.toEqual(expectedError);
        expect(expectedAwaitable).toHaveBeenCalledTimes(expectedNumberOfRetries + 1);
      });
    });

    describe('when a concurrency value is specified in configuration', () => {
      it('should resolve the configured number of tasks at once', async () => {
        // Arrange
        let maxConcurrency = 0;
        const expectedConcurrency = 10;
        const underTest = new Queue({ concurrency: expectedConcurrency });

        const awaitable = async () => {
          return new Promise((resolve) => {
            const { running } = underTest.stats();
            if (running > maxConcurrency) maxConcurrency = running;
            setTimeout(resolve, 10);
          });
        };

        const promises: Promise<any>[] = [];

        // Act
        for (let i = 0; i < expectedConcurrency * 2; i++) {
          promises.push(underTest.add(awaitable, {}));
        }

        await Promise.all(promises);

        // Assert
        expect(maxConcurrency).toEqual(expectedConcurrency);
      });
    });

    describe('when a LIFO mode is specified in configuration', () => {
      it('should resolve tasks in LIFO order', async () => {
        // Arrange
        const underTest = new Queue({ mode: QUEUE_MODE.LIFO });

        const awaitable = jest.fn().mockImplementation(async (input: { i: number }) => input.i);

        const promises: Promise<any>[] = [];

        for (let i = 0; i < 3; i++) {
          let deferred = new Deferred();

          const promise = new Promise((resolve, reject) => {
            deferred = new Deferred({ resolve, reject });
          });

          // @ts-ignore
          underTest._enqueueTask(new Task({
            awaitable,
            input: { i },
            deferred,
          }));

          promises.push(promise);
        }

        // Act
        underTest.start();
        await Promise.all(promises);

        // Assert
        expect(awaitable).toHaveBeenNthCalledWith(1, { i: 2 });
        expect(awaitable).toHaveBeenNthCalledWith(2, { i: 1 });
        expect(awaitable).toHaveBeenNthCalledWith(3, { i: 0 });
      });
    });

    describe('when a queue mode is somehow undefined', () => {
      it('should resolve tasks in FIFO order', async () => {
        // Arrange
        const underTest = new Queue();
        // @ts-ignore
        underTest._mode = undefined;

        const awaitable = jest.fn().mockImplementation(async (input: { i: number }) => input.i);

        const promises: Promise<any>[] = [];

        for (let i = 0; i < 3; i++) {
          let deferred = new Deferred();

          const promise = new Promise((resolve, reject) => {
            deferred = new Deferred({ resolve, reject });
          });

          // @ts-ignore
          underTest._enqueueTask(new Task({
            awaitable,
            input: { i },
            deferred,
          }));

          promises.push(promise);
        }

        // Act
        underTest.start();
        await Promise.all(promises);

        // Assert
        expect(awaitable).toHaveBeenNthCalledWith(1, { i: 0 });
        expect(awaitable).toHaveBeenNthCalledWith(2, { i: 1 });
        expect(awaitable).toHaveBeenNthCalledWith(3, { i: 2 });
      });
    });
  });
});
