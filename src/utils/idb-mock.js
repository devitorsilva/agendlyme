// Mock para idb (IndexedDB) que não funciona no React Native
// Este arquivo substitui a dependência idb quando o app roda no React Native

const idbMock = {
  openDB: () =>
    Promise.resolve({
      close: () => Promise.resolve(),
      transaction: () => ({
        objectStore: () => ({
          add: () => Promise.resolve(),
          put: () => Promise.resolve(),
          get: () => Promise.resolve(),
          delete: () => Promise.resolve(),
          clear: () => Promise.resolve(),
          count: () => Promise.resolve(0),
          getAll: () => Promise.resolve([]),
          getAllKeys: () => Promise.resolve([]),
        }),
        done: Promise.resolve(),
      }),
    }),
  deleteDB: () => Promise.resolve(),
};

module.exports = idbMock;
