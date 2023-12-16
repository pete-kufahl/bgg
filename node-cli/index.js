const { program } = require('commander');
const { fetchDataWithRetry } = require('./allCommand');

program
    .version('1.0.0')
    .description('A CLI tool for calling a remote URL with a username and reading the XML response')

program
    .command('all')
    .description('Fetch data for all records')
    .requiredOption('-u, --username <username>', 'The username to include in the URL')
    .option('-s, --startdate <date>', 'Start date for data fetching. Default: Seven days ago.')
    .option('-e, --enddate <date>', 'End date for data fetching. Default: Now.')
    .action((options) => {
        const { username, startdate, enddate } = options;
        fetchDataWithRetry(username, startdate, enddate);
      });;

program.parse(process.argv);
