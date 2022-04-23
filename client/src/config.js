const config = {};
Object.entries(window)
  .filter(([k]) => {
    return k.startsWith('VUE_APP_');
  })
  .map(([k, v]) => {
    config[k] = v;
  });

console.info('Current configuration', config);

export default config
