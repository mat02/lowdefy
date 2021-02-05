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
import dotenv from 'dotenv';
import fse from 'fs-extra';

import startUp from '../../utils/startUp';

async function prepare(options) {
  dotenv.config({ silent: true });
  // Setup
  if (!options.port) options.port = 3000;
  const context = await startUp(options);
  context.print.log(
    `Cleaning block meta cache at "${path.resolve(context.cacheDirectory, './meta')}".`
  );
  await fse.emptyDir(path.resolve(context.cacheDirectory, './meta'));
  return context;
}

export default prepare;
