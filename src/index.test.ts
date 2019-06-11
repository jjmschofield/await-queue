import * as expectedQueueExports from './Queue';
import * as underTest from './index';

describe('src/index.ts', () => {
  it('should export all imports', () => {
    expect(underTest.QUEUE_MODE).toBe(expectedQueueExports.QUEUE_MODE);
    expect(underTest.Queue).toBe(expectedQueueExports.Queue);
    expect(underTest.default).toBe(expectedQueueExports.Queue);
  });

  it('should not have untested exports', () => {
    expect(Object.keys(underTest).length).toEqual(3);
  });
});

