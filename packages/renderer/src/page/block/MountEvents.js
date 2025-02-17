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

import React, { useEffect, useState } from 'react';
import { type } from '@lowdefy/helpers';

const MountEvents = ({
  asyncEventName,
  context,
  eventName,
  triggerEvent,
  initEventsTriggered,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let mounted = true;
    const mount = async () => {
      try {
        await triggerEvent({ name: eventName, context });
        if (mounted) {
          triggerEvent({ name: asyncEventName, context });
          setLoading(false);
        }
        if (type.isFunction(initEventsTriggered)) {
          initEventsTriggered(true);
        }
      } catch (err) {
        setError(err);
      }
    };
    mount();
    return () => {
      mounted = false;
    };
  }, [context]);

  if (error) throw error;

  if (loading) return <>{children(false)}</>;

  return <>{children(true)}</>;
};

export default MountEvents;
