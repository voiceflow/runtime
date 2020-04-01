import { expect } from 'chai';

import Store from '@/lib/Context/Store';
import { createCombinedVariables, mapStores, saveCombinedVariables } from '@/lib/Context/utils/variables';

describe('Context utils variables', () => {
  it('createCombinedVariables', () => {
    const global = new Store();
    const globalVar = 'global-val';
    global.set('globalVar', globalVar);
    const local = new Store();
    const localVar = 'local-val';
    local.set('localVar', localVar);

    const combinedStore = createCombinedVariables(global, local);
    expect(combinedStore.get('globalVar')).to.eql(globalVar);
    expect(combinedStore.get('localVar')).to.eql(localVar);
  });

  it('mapStores', () => {
    const map = [
      ['a1', 'a2'],
      ['b1', 'b2'],
    ];
    const a = 'valA';
    const b = 'valB';
    const store1 = new Store();
    const store2 = new Store();
    store1.set('a1', a);
    store1.set('b1', b);

    mapStores(map as any, store1, store2);
    expect(store2.get('a2')).to.eql(a);
    expect(store2.get('b2')).to.eql(b);
  });

  it('saveCombinedVariables', () => {
    const combined = new Store();
    const localVar = 'local-val';
    combined.set('localVar', localVar);
    const globalVar = 'global-val';
    combined.set('globalVar', globalVar);
    const newVar = 'new-val';
    combined.set('newVar', newVar);
    const global = new Store();
    global.set('globalVar', 0);
    const local = new Store();
    local.set('localVar', 0);

    saveCombinedVariables(combined, global, local);
    expect(local.get('localVar')).to.eql(localVar);
    expect(local.get('newVar')).to.eql(newVar);
    expect(global.get('globalVar')).to.eql(globalVar);
  });
});
