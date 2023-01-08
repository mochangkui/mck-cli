'use strict';

const npmlog = require('npmlog')

npmlog.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info' // 判断debug模式

npmlog.heading = 'mck-cli' // 修改前缀
npmlog.addLevel('success', 2000, { fg: 'green', bold: true }) // 添加自定义命令

module.exports = npmlog;