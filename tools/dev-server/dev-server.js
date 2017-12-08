const pathResolve = require('path').resolve;
const appRootPath = require('app-root-dir').get();
const dyson = require('dyson');
const colors = require('colors/safe');

const config = require('config');
const { mocksDirectory, port } = config.get('dev-server');

const options = {
  configDir: pathResolve(appRootPath, mocksDirectory),
  port,
};

const configs = dyson.getConfigurations(options);
const appBefore = dyson.createServer(options);
appBefore.use((req, res, next) => {
  console.log(req.url);
  next();
});

dyson.registerServices(appBefore, options, configs);
console.log(colors.green('------------------------------------'));
console.log(colors.green('    __  _______  ________ _______'));
console.log(colors.green('   /  |/  / __ \\/ ____/ //_/ ___/ '));
console.log(colors.green('  / /|_/ / / / / /   / ,<  \\__ \\ '));
console.log(colors.green(' / /  / / /_/ / /___/ /| |___/ /    '));
console.log(colors.green('/_/  /_/\\____/\\____/_/ |_/____/  '));
console.log(colors.green('------------------------------------'));

console.log(`Dyson listening at port ${options.port}`);
