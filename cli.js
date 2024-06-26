#!/usr/bin/env node

const boxen = require('boxen')
const yargs = require('yargs/yargs')(process.argv.slice(2))

yargs
   .command('$0', 'Display interactive menu', () => {}, (argv) => {
      console.log(boxen('Micro wallet 1.0.0', {
         borderColor: "green", 
         padding: 1, 
         margin: 1,
         borderStyle: 'bold'
      }))
   })
   .option('yes', {
      alias: 'y',
      type: 'boolean',
      desc: 'Automatically answer "yes" to any prompts'
   })
   .commandDir('cmds')
   .demandCommand()
   .help()
   .argv

