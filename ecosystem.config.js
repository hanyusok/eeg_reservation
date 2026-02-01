module.exports = {
    apps: [
        {
            name: "eeg-reservation",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                // Add other environment variables here if needed
            },
        },
    ],
};
