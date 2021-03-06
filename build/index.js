/*
 * Copyright IBM Corporation 2016-2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'
var debug = require('debug')('generator-swiftserver:app')

var Generator = require('yeoman-generator')
var chalk = require('chalk')
var os = require('os')

var actions = require('../lib/actions')

module.exports = Generator.extend({
  initializing: {
    config: function () {
      if (!this.options.singleShot) {
        actions.ensureInProject.call(this)
      }
    }
  },

  install: {
    ensureRequiredSwiftInstalled: actions.ensureRequiredSwiftInstalled,
    buildSwift: function () {
      return new Promise((resolve, reject) => {
        var opts = []
        if (os.platform() === 'darwin') {
          opts = ['-Xlinker', '-lc++']
        }
        var buildProcess = this.spawnCommand('swift', ['build'].concat(opts))
        buildProcess.on('error', (err) => {
          debug(`error spawning command "swift build": ${err}`)
          reject(new Error(chalk.red('Failed to launch build')))
        })
        buildProcess.on('close', (code, signal) => {
          if (code) {
            reject(new Error(chalk.red('swift build command completed with errors')))
            return
          }

          this.log(chalk.green('swift build command completed'))
          resolve()
        })
      }).catch(err => this.env.error(err))
    },

    generateXCodeprojFile: function () {
      return new Promise((resolve, reject) => {
        var buildProcess = this.spawnCommand('swift', ['package', 'generate-xcodeproj'])
        buildProcess.on('error', (err) => {
          debug(`error spawning command "swift package generate-xcodeproj": ${err}`)
          reject(new Error(chalk.red('Failed to generate <application>.xcodeproj file')))
        })
        buildProcess.on('close', (code, signal) => {
          if (code) {
            reject(new Error(chalk.red('swift package generate-xcodeproj command completed with errors')))
            return
          }

          this.log(chalk.green('generate .xcodeproj command completed'))
          resolve()
        })
      }).catch(err => this.env.error(err))
    }
  }
})
