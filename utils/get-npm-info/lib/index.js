'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

// 获取npm中包的信息
function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registryUrl, npmName)
    console.log(npmInfoUrl)
    return axios.get(npmInfoUrl).then((res) => {
        if (res.status === 200) {
            return res.data
        }
        return null
    }).catch(err => {
        return Promise.reject(err)
    })
}

// 获取npm源
function getDefaultRegistry (isOriginal = false) {
    return isOriginal ? 'http://registry.npmjs.org' : 'http://registry.npm.taobao.org'
}

// 获取npm中包的所有版本号
async function getNpmVersions (npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

// 获取大于当前版本的所有版本号
function getSemverVersions (baseVersion, versions) {
    return versions
        .filter((version) => semver.satisfies(version, `^${baseVersion}`))
        .sort((a, b) => {
            if (semver.gt(b, a)) {
                return 1
            } else {
                return -1
            }
        })
}

// 获取最后所需的所有版本号
async function getNpmSemverVersion (baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion
}
