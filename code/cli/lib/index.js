'use strict';

module.exports = core;

const path = require('path')
// require()可以解析.js、.json、.node，如果是其他格式文件（.txt、.md）等将默认通过js进行解析
const pkg = require('../package.json')
// 封装的npmlog库
const log = require('@mck-cli/log')
// 获取npm API信息
const { getNpmInfo, getNpmVersions, getNpmSemverVersion } = require('@mck-cli/get-npm-info')
// 定义的常量
const constant = require('./const')
// 比较版本号
const semver = require('semver')
// 设置文本颜色
const colors = require('colors')
// 获取用户主目录
const userHome = require('user-home')
// 判断文件是否存在
const pathExists = require('path-exists')

async function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checkEnv()
        await checkGlobalUpdate()
    } catch (error) {
        log.error(error.message)
    }
}

// 检查mck-cli版本号
function checkPkgVersion () {
    log.notice('version', pkg.version)
}

// 检查node最低版本号
function checkNodeVersion () {
    const currentNodeVersion = process.version // 当前node版本号
    const lowestNodeVersion = constant.LOWEST_NODE_VERSION // node最低版本号
    if (!semver.gte(currentNodeVersion, lowestNodeVersion)) {
        throw new Error(colors.red(`mck-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`))
    }
}

// 检查root账户
function checkRoot () {
    // 检查root账户，自动降级
    const rootCheck = require('root-check')
    rootCheck()
}

// 检查用户主目录
function checkUserHome () {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在！'))
    }
}

// 检查参数
function checkInputArgs () {
    const minimist = require('minimist')
    const args = minimist(process.argv.slice(2))
    checkDebug(args)
    log.verbose('debug', 'test debug log')
}

// 支持debug模式
function checkDebug (args) {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

// 检查环境变量
function checkEnv () {
    const dotEnv = require('dotenv')
    const dotEnvPath = path.resolve(userHome, '.env')
    if (pathExists(dotEnvPath)) {
        dotEnv.config({
            path: dotEnvPath
        })
    }
    createDefaultConfig()
    console.log(process.env.CLI_HOME_PATH)
}
function createDefaultConfig () {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查更新脚手架
async function checkGlobalUpdate () {
    const currentVersion = pkg.version
    const npmName = pkg.name
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}，更新命令：npm install -g ${npmName}`)
    }
}