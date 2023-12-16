// index.js

const axios = require('axios');
const { program } = require('commander');
const { parseString } = require('xml2js');

program
  .version('1.0.0')
  .description('A CLI tool for calling a remote URL with a username and reading the XML response')
  .requiredOption('-u, --username <username>', 'The username to include in the URL')
  .option('-s, --startdate <date>', 'Start date for data fetching')
  .option('-e, --enddate <date>', 'End date for data fetching');

program.parse(process.argv);

const { username, startdate, enddate } = program.opts();

if (!username) {
  console.error('Error: Missing required option --username');
  process.exit(1);
}

// Define the URL template with placeholders for username, startdate, and enddate
// f'https://boardgamegeek.com/xmlapi2/plays?username={username}&mindate={mindate}&maxdate={maxdate}&type=thing&subtype=boardgame&brief=1'
const apiUrlTemplate1 = 'https://boardgamegeek.com/xmlapi2/plays?username=%USERNAME%&mindate=%MINDATE%&maxdate=%MAXDATE%&type=thing&subtype=boardgame&brief=1';

// Replace placeholders in the URL template with actual values
//  bgg mindate = startdate, bgg maxdate = enddate
const apiUrl1 = apiUrlTemplate1
  .replace('%USERNAME%', encodeURIComponent(username))
  .replace('%MINDATE%', startdate ? encodeURIComponent(startdate) : '')
  .replace('%MAXDATE%', enddate ? encodeURIComponent(enddate) : '');

// Function to make the HTTP request and parse XML
async function fetchDataWithRetry() {
    let retryCount = 0;
    const maxRetries = 3; // Adjust the maximum number of retries as needed
  
    do {
      if (retryCount > 0) {
        console.log(`Retrying (attempt ${retryCount})...`);
        await sleep(330); // Wait for 0.33 seconds before retrying
      }

      try {
        const response = await axios.get(apiUrl1);
  
        if (response.status === 200) {
          const xmlData = response.data;
  
          // Parse XML to JavaScript object
          parseString(xmlData, (err, result) => {
            if (err) {
              console.error('Error parsing XML:', err.message);
            } else {
              console.log('Parsed XML:', JSON.stringify(result, null, 2));
            }
          });
  
          return; // Exit the loop if the response is 200
        } else if (response.status === 202) {
          console.log(`Received 202 status code. Retrying...`);
        } else {
          console.error(`Unexpected status code: ${response.status}`);
          return; // Exit the loop for unexpected status codes
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        return; // Exit the loop on error
      }
  
      retryCount++;
    } while (retryCount <= maxRetries);
  
    console.error(`Max retries reached. Unable to get a 200 status code.`);
  }
  
  // Helper function to introduce a delay
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Call the function with retry logic
  fetchDataWithRetry();
