import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import Dotenv from 'dotenv-webpack';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const deps = require('./package.json').dependencies;
const printCompilationMessage = require('./compilation.config.js');

export default (_env: unknown, argv: { mode?: string }): Configuration => {
  const mode = argv.mode || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });

  const publicPath = process.env.RMU_MFE_TACTICAL;

  return {
    output: {
      publicPath,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    devServer: {
      allowedHosts: 'all',
      host: '0.0.0.0',
      port: process.env.PORT as unknown as number,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      watchFiles: [path.resolve(__dirname, 'src')],
      onListening: function (devServer: any) {
        const port = devServer.server.address().port;
        printCompilationMessage('compiling', port);
        devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats: any) => {
          setImmediate(() => {
            if (stats.hasErrors()) {
              printCompilationMessage('failure', port);
            } else {
              printCompilationMessage('success', port);
            }
          });
        });
      },
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(css|s[ac]ss)$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(ico|jpg|jpeg|png|gif|jfif)$/i,
          use: ['file-loader'],
        },
        {
          test: /\.json$/,
          type: 'javascript/auto',
          use: 'json-loader',
        },
      ],
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
          },
        ],
      }),
      new ModuleFederationPlugin({
        name: 'tactical',
        filename: 'tactical-app.js',
        remotes: {},
        exposes: {
          './TacticalApp': './src/App.tsx',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
          '@mui/material': { singleton: true, requiredVersion: deps['@mui/material'] },
          '@mui/icons-material': { singleton: true, requiredVersion: deps['@mui/icons-material'] },
          '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
          '@emotion/styled': { singleton: true, requiredVersion: deps['@emotion/styled'] },
          'react-oidc-context': { singleton: true, requiredVersion: deps['react-oidc-context'] },
          'oidc-client-ts': { singleton: true, requiredVersion: deps['react-oidc-context'] },
          'react-i18next': { singleton: true, requiredVersion: deps['react-i18next'] },
        },
      }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
      }),
      new Dotenv({
        path: `./.env.${argv.mode || 'development'}`,
        safe: false,
        systemvars: true,
        silent: false,
        defaults: './.env',
      }),
    ],
  };
};
