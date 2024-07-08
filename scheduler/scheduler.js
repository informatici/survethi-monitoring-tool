const cron = require('node-cron');
const axios = require('axios');

require('dotenv').config();

const url = 'http://localhost:3000/generate-pdf';
const cronSchedule = process.env.CRON_SCHEDULE || '* * * * *'; // Default to run every minute if not set

console.log(`Scheduler started.`);

// * * * * * command_to_execute
// | | | | |
// | | | | +---- Day of the week (0 - 7) (Sunday is 0 and 7)
// | | | +------ Month (1 - 12)
// | | +-------- Day of the month (1 - 31)
// | +---------- Hour (0 - 23)
// +------------ Minute (0 - 59)
//
// Special Characters:
//  *: Matches any value (wildcard)
//  ,: Separates multiple values (e.g., 1,15 in the minute field means "at minutes 1 and 15")
//  -: Specifies a range of values (e.g., 1-5 in the day of the week field means "Monday through Friday")
//  /: Specifies a step value (e.g., */5 in the minute field means "every 5 minutes")
cron.schedule(cronSchedule, async () => {
    console.log(`Scheduler running...`);
    try {
        const response = await axios.get(url, { timeout: 10000 }); // 10 seconds
        console.log('Scheduled task response:', response.data);
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
    console.log(`Scheduler ended.`);
});

// Keep the script running
process.stdin.resume();