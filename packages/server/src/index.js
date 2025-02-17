/*
  Copyright 2020-2021 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers, createContext } from '@lowdefy/graphql';
import { get } from '@lowdefy/helpers';
import { readFile } from '@lowdefy/node-utils';

function getServer({
  buildDirectory,
  development = false,
  getSecrets,
  gqlExpressPath,
  gqlUri,
  logger,
  publicDirectory,
  serverBasePath = '',
  serveStaticFiles = true,
  shellDirectory,
}) {
  const context = createContext({
    CONFIGURATION_BASE_PATH: buildDirectory,
    development,
    getSecrets,
    gqlUri,
    logger,
  });
  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  let indexHtml = null;

  if (serverBasePath !== '') {
    serverBasePath = `/${serverBasePath}`;
  }

  const serveIndex = async (req, res) => {
    // TODO: can do better here?
    if (!indexHtml || development) {
      indexHtml = await readFile(path.resolve(shellDirectory, 'index.html'));
      let appConfig = await readFile(path.resolve(buildDirectory, 'app.json'));
      appConfig = JSON.parse(appConfig);
      indexHtml = indexHtml.replace(
        '<!-- __LOWDEFY_APP_HEAD_HTML__ -->',
        get(appConfig, 'html.appendHead', { default: '' })
      );
      indexHtml = indexHtml.replace(
        '<!-- __LOWDEFY_APP_BODY_HTML__ -->',
        get(appConfig, 'html.appendBody', { default: '' })
      );
      indexHtml = indexHtml.replace(/__LOWDEFY_SERVER_BASE_PATH__/g, serverBasePath);
    }
    res.send(indexHtml);
  };

  const server = express();

  gqlServer.applyMiddleware({
    app: server,
    path: gqlExpressPath || `${serverBasePath}/api/graphql`,
    bodyParserConfig: { limit: '5mb' },
  });

  if (serveStaticFiles) {
    // serve index.html with appended html
    // else static server serves without appended html
    server.get(`${serverBasePath}/`, serveIndex);

    server.use(`${serverBasePath}/shell`, express.static(path.resolve(shellDirectory)));

    // serve public files
    server.use(`${serverBasePath}/public`, express.static(path.resolve(publicDirectory)));

    // Redirect all 404 to index.html with status 200
    // This should always be the last route
    server.use(`${serverBasePath}/*`, serveIndex);
  }
  return server;
}

export default getServer;
