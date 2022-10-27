const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// App directory
const appDirectory = fs.realpathSync(process.cwd());


module.exports = {
    entry: path.resolve(appDirectory, "src/index.ts"), //path to the main .ts file
    output: {
        filename: 'js/babylonBundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            include: path.resolve('src'),
            loader: 'source-map-loader',

            enforce: 'pre',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|env|glb|stl)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                }, ],
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "index.html"),
        }),
    ],
}