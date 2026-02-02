module.exports = {
    apps: [
        {
            name: "eeg-reservation",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
