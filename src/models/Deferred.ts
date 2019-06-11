export class Deferred {
  constructor({ resolve, reject }: { resolve?: (input: any) => any, reject?: (input: any) => any } = {}) {
    if (resolve) this.resolve = resolve;
    if (reject) this.reject = reject;
  }

  resolve(input: any): any {
    throw Error('Deffered does not implement a resolve action');
  }

  reject(input: any): any {
    throw Error('Deffered does not implement a reject action');
  }
}

export default Deferred;
