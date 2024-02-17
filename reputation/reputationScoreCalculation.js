const nodeCron = require("node-cron");
const { exec } = require('child_process');

const runReputationScoreCalculation = async () => {
    const cmd = 'cd reputation &&\ python3 calculate_reputation_routine.py'.replace(/\n/g, '\\\n');
    const cron_schedule = '0 12 * * *';

    // run every day at 12 PM
    // nodeCron.schedule(cron_schedule, async () => {
        // run python script to calculate reputation score
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(`Error in runReputationScoreCalculation: ${err.message}`);
                return;
            }
            if (stderr) {
                console.log(`Error in runReputationScoreCalculation: ${stderr}`);
                return;
            }
            console.log(`Reputation score calculation: ${stdout}`);
        });
    // });

    return "Reputation score calculation has been scheduled";
};

module.exports = {
    runReputationScoreCalculation
}
