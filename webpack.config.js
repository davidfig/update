module.exports = {
    entry: './index.js',
    output: {
        filename: 'index.compiled.js'
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000
    },
    devServer: {
        port: 9000
    }
};