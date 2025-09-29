// Mock para localforage que não funciona no React Native
// Este arquivo substitui a dependência localforage quando o app roda no React Native

const localforageMock = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  length: () => Promise.resolve(0),
  key: () => Promise.resolve(null),
  keys: () => Promise.resolve([]),
  iterate: () => Promise.resolve(),
  config: () => localforageMock,
  createInstance: () => localforageMock,
  defineDriver: () => localforageMock,
  driver: () => localforageMock,
  ready: () => Promise.resolve(),
  setDriver: () => localforageMock,
  supports: () => false,
};

module.exports = localforageMock;
