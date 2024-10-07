module.exports = {
    apps: [
        {
            name: "solid-mp3",
            script: "npm run build", //start",
            watch: ["dist"],
            // Delay between restart
            watch_delay: 1000,
            ignore_watch: [
                "node_modules",
                "stuff",
                "\\.git",
                "*.log",
                "*.json",
                "*.mp3",
                "*.webp",
            ],
            env: {
                PORT: 3038,
            },
        },
    ],
};