#!/usr/bin/env node

const opn = require('opn')
const os = require('os')
const program = require('commander')
const { exec } = require('child_process')
const chalk = require('chalk')
const packageJSON = require('./package.json')
const {
  GIT_REPOSITORY_URL, BASE_BRANCH, DEVELOP_BRANCH, REDUX_BRANCH, ADMOB_BRANCH,
} = require('./constants')

const platform = os.platform()

let projectName
let option

// Function
const createProject = () => {
  console.log('Create project...')

  let branch = BASE_BRANCH
  if (option.develop) {
    branch = DEVELOP_BRANCH
  } else if (option.redux) {
    branch = REDUX_BRANCH
  } else if (option.admob) {
    branch = ADMOB_BRANCH
  }
  const cmd = `rm -rf ${projectName} && git clone --single-branch -b ${branch} ${GIT_REPOSITORY_URL} ${projectName} && rm -rf ${projectName}/.git`
  exec(cmd)
}

const installGit = () => {
  console.log('Install Git...')
  let cmd = ''
  if (platform === 'linux') {
    cmd = 'sudo apt-get install git'
  }
  if (cmd !== '') {
    exec(cmd, (error, stdout, stderr) => {
      if (stderr) {
        console.log(chalk.red(stderr))
      } else {
        createProject()
      }
    })
  } else {
    console.log(chalk.red('Can not install Git'))
    opn('https://git-scm.com/downloads').then(() => {
      process.exit()
    })
  }
}

const checkAndCreateProject = (args, opt) => {
  projectName = args
  option = opt

  exec('git --version', (error, stdout) => {
    if (stdout.indexOf('git version') === -1) {
      installGit()
    } else {
      createProject()
    }
  })
}

program
  .name(packageJSON.name)
  .version(packageJSON.version)
  .command('create <project-name>')
  .alias('c')
  .option('-b --base', 'Default Expo project with Babel, ESLint, Flow, Prettier.')
  .option('-d --develop', 'base + redux + admob.')
  .option('-r --redux', 'base + redux.')
  .option('-a --admob', 'base + admob.')
  .action(checkAndCreateProject)

program.parse(process.argv)
