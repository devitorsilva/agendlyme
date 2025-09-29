try {
  require.resolve("react-hook-form");
  console.log("✅ react-hook-form está resolvendo corretamente");
} catch (e) {
  console.error("❌ react-hook-form NÃO pôde ser resolvido");
  console.error(e);
}
