import Task from './Task';
import Deferred from './Deferred';

describe('src/models/Task.ts', () => {
  describe('given a valid task config', () => {
    describe('when constructed', () => {
      it('should set the provided config options on the model', () => {
        // Arrange
        const expectedInput = { a: 'a', b: 'b' };
        const expectedDeferred = new Deferred();
        const expectedAwaitable = jest.fn();

        // Act
        const underTest = new Task({
          input: expectedInput,
          deferred: expectedDeferred,
          awaitable: expectedAwaitable,
        });

        // Assert
        expect(underTest.input).toBe(expectedInput);
        expect(underTest.deferred).toBe(expectedDeferred);
        expect(underTest.awaitable).toBe(expectedAwaitable);
      });
    });

    describe('given that an awaitable has been provided', () => {
      describe('when awaitable is called', () => {
        it('should call awaitable with the provided input', () => {
          // Arrange
          const expectedInput = { a: 'a', b: 'b' };
          const expectedAwaitable = jest.fn();

          const underTest = new Task({
            input: expectedInput,
            deferred: new Deferred(),
            awaitable: expectedAwaitable,
          });

          // Act
          underTest.awaitable(expectedInput);

          // Assert
          expect(expectedAwaitable).toHaveBeenCalledWith(expectedInput);
        });
      });
    });

    describe('given that an awaitable has not been provided', () => {
      describe('when awaitable is called', () => {
        it('should throw an error', async () => {
          // Arrange
          const expectedError = expect.objectContaining({ message: expect.stringContaining('awaitable') });

          const underTest = new Task({
            input: {},
            deferred: new Deferred(),
            // @ts-ignore
            awaitable: undefined,
          });

          // Assert
          await expect(underTest.awaitable({})).rejects.toEqual(expectedError);
        });
      });
    });
  });
});
