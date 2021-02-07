const TRACE = 10;
const DEBUG = 20;
const INFO = 30;
const WARN = 40;
const ERROR = 50;
const FATAL = 60;

module.exports = {
  filterFunction: (message) => {
    return message.context && message.context.logLevel >= INFO;
  },
};
