const path = require('path');
const HTMLWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = {
	devtool: 'eval',
	entry: {
		app: './src/js/main.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/app.bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				exclude: '/node_modules/',
				use: [
					{
						loader: 'html-loader',
						options: {
							minimize: true,
						},
					},
				],
			},
			{
				test: /\.css$/,
				exclude: '/node_modules/',
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
					},
				],
			},
			{
				test: /\.scss$/,
				exclude: '/node_modules/',
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.(png|jpg|gif)$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'assets',
						},
					},
				],
			},
			{
				test: /\.js$/,
				exclude: '/node_modules/',
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
		],
	},
	plugins: [
		new HTMLWebPackPlugin({
			template: 'src/index.html',
			filename: './index.html',
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].bundle.css',
		}),
		new WebappWebpackPlugin({
			logo: './src/img/icon.png',
			favicons: {
				appName: 'Loan_Calculator',
				appDescription: "This Program help's you to Calculate Loan Repayment Amount",
				developerName: 'Abdul Samad',
				developerURL: null,
				background: '#d3d3d3',
				theme_color: '#009688',
				icons: {
					coast: false,
					yandex: false,
				},
			},
		}),
		new WebpackPwaManifest({
			name: 'Loan Calculator',
			short_name: 'Loan Calculator',
			description: "This Program help's you to Calculate Loan Repayment Amount",
			background_color: '#c4c4c4',
			theme_color: '#009688',
			'theme-color': '#009688',
			start_url: '/',
			icons: [
				{
					src: path.resolve('src/img/icon.png'),
					sizes: [96, 128, 192],
					destination: path.join('assets', 'icons'),
				},
			],
		}),
		new SWPrecacheWebpackPlugin({
			cacheId: 'loan_calculator',
			dontCacheBustUrlsMatching: /\.\w{8}\./,
			filename: 'service-worker.js',
			minify: true,
			navigateFallback: 'https://asamad05.github.io/loan_calculator',
			staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/],
		}),
	],
	optimization: {
		minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
	},
	externals: {
		moment: 'moment',
	},
	devServer: {
		contentBase: 'dist',
		port: 8080,
		watchContentBase: true,
	},
};
