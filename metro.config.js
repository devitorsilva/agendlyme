// const { getDefaultConfig } = require("expo/metro-config");
// const path = require("path");

// const config = getDefaultConfig(__dirname);

// // Configurações adicionais para resolver problemas de bundling
// config.resolver.platforms = ["ios", "android", "native", "web"];

// // Configuração para resolver problemas com arquivos anônimos
// config.resolver.sourceExts = ["js", "jsx", "json", "ts", "tsx"];

// // Resolver problemas com Firebase e dependências web-only
// config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// // Configuração para resolver dependências do Firebase que não funcionam no React Native
// config.resolver.alias = {
//   // Substituir idb por um mock vazio para React Native
//   idb: path.resolve(__dirname, "src/utils/idb-mock.js"),
//   // Outras dependências web-only que podem causar problemas
//   localforage: path.resolve(__dirname, "src/utils/localforage-mock.js"),
//   // Resolver problemas com use-latest-callback
//   "use-latest-callback": path.resolve(
//     __dirname,
//     "src/utils/use-latest-callback-mock.js"
//   ),
// };

// // Configuração para ignorar módulos problemáticos
// config.resolver.blockList = [
//   // Ignorar arquivos que causam problemas no React Native
//   /.*\/node_modules\/idb\/.*/,
//   /.*\/node_modules\/localforage\/.*/,
//   /.*\/node_modules\/use-latest-callback\/.*/,
// ];

// // Configuração adicional para resolver problemas de módulos
// config.resolver.unstable_enableSymlinks = false;
// config.resolver.unstable_enablePackageExports = false;

// // Configuração para resolver problemas com react-hook-form e outras dependências
// config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

// // Configuração para resolver problemas com assets
// config.resolver.assetExts = ["png", "jpg", "jpeg", "gif", "svg", "webp"];

// module.exports = config;

// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// --- Ajuste para pacotes com exports quebrados no Metro (ex: react-hook-form) ---
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    "react-hook-form": require.resolve("react-hook-form"),
  },
};

module.exports = config;
