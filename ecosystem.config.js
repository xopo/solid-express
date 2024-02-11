module.exports = {
    apps: [{
        name: 'pingpong',
        script: "npm start",
        watch: ["dist"],
        // Delay between restart
        watch_delay: 1000,
        ignore_watch : ["node_modules", "stuff", "\\.git", "*.log", "*.json", , "*.webp"],
        env: {
            "PORT": 3088,
        }
    }]
}