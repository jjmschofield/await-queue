import Deferred from './Deferred';

describe('src/models/Deferred.ts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('given it has been constructed with a resolve function', () => {
    describe('when resolve is called', () => {
      it('should call the provided resolve function with the supplied payload', () => {
        // Arrange
        const expectedFunc = jest.fn();
        const underTest = new Deferred({ resolve: expectedFunc });
        const expectedPayload = { someProp: 'some value' };

        // Act
        underTest.resolve(expectedPayload);

        // Assert
        expect(expectedFunc).toHaveBeenCalledWith(expectedPayload);
        expect(expectedFunc).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('given it has been constructed with a reject function', () => {
    describe('when resolve is called', () => {
      it('should call the provided reject function with the supplied error', () => {
// Arrange
        const expectedFunc = jest.fn();
        const underTest = new Deferred({ reject: expectedFunc });
        const expectedPayload = new Error('some error');

        // Act
        underTest.reject(expectedPayload);

        // Assert
        expect(expectedFunc).toHaveBeenCalledWith(expectedPayload);
        expect(expectedFunc).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('given it has not been constructed with a resolve function', () => {
    describe('when resolve is called', () => {
      it('should throw an error', () => {
        // Arrange
        const underTest = new Deferred();

        const expectedError = expect.objectContaining({ message: expect.stringContaining('resolve') });

        // Assert
        expect(underTest.resolve).toThrowError(expectedError);
      });
    });
  });

  describe('given it has not been constructed with a reject function', () => {
    describe('when reject is called', () => {
      it('should throw an error', () => {
        // Arrange
        const underTest = new Deferred();

        const expectedError = expect.objectContaining({ message: expect.stringContaining('reject') });

        // Assert
        expect(underTest.reject).toThrowError(expectedError);
      });
    });
  });
});
