const inquirer = require('inquirer');

const questions = [
  {
    type: 'list',
    name: 'language',
    message: 'What language is it?',
    choices: ['Javascript', 'Typescript'],
    filter: function(val) {
      return val.toLowerCase();
    }
  }
]