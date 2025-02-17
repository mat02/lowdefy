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

import React from 'react';
import { AutoComplete } from 'antd';
import { blockDefaultProps, renderHtml } from '@lowdefy/block-tools';
import { type } from '@lowdefy/helpers';

import Label from '../Label/Label';
import getUniqueValues from '../../getUniqueValues';

const Option = AutoComplete.Option;

const AutoCompleteInput = ({
  blockId,
  events,
  loading,
  methods,
  properties,
  required,
  validation,
  value,
}) => {
  const uniqueValueOptions = getUniqueValues(properties.options || []);
  return (
    <Label
      blockId={blockId}
      events={events}
      properties={{ title: properties.title, size: properties.size, ...properties.label }}
      validation={validation}
      required={required}
      loading={loading}
      content={{
        content: () => (
          <AutoComplete
            id={`${blockId}_input`}
            autoFocus={properties.autoFocus}
            backfill={properties.backfill}
            className={methods.makeCssClass(properties.inputStyle)}
            defaultOpen={properties.defaultOpen}
            disabled={properties.disabled}
            placeholder={properties.placeholder || 'Type or select item'}
            allowClear={properties.allowClear !== false}
            size={properties.size}
            filterOption={(input, option) =>
              (option.filterstring || option.children.props.html || '')
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            onChange={(newVal) => {
              let val = type.isPrimitive(uniqueValueOptions[newVal])
                ? uniqueValueOptions[newVal]
                : uniqueValueOptions[newVal].value;
              if (type.isNone(val)) {
                val = newVal;
              }
              methods.setValue(val);
              methods.triggerEvent({ name: 'onChange' });
            }}
            value={type.isNone(value) ? undefined : value}
          >
            {(properties.options || []).map((opt, i) =>
              type.isPrimitive(opt) ? (
                <Option
                  className={methods.makeCssClass(properties.optionsStyle)}
                  id={`${blockId}_${i}`}
                  key={i}
                  value={i}
                >
                  {renderHtml({ html: `${opt}`, methods })}
                </Option>
              ) : (
                <Option
                  className={methods.makeCssClass([properties.optionsStyle, opt.style])}
                  disabled={opt.disabled}
                  filterstring={opt.filterString}
                  id={`${blockId}_${i}`}
                  key={i}
                  value={i}
                >
                  {type.isNone(opt.label)
                    ? renderHtml({ html: `${opt.value}`, methods })
                    : renderHtml({ html: opt.label, methods })}
                </Option>
              )
            )}
          </AutoComplete>
        ),
      }}
    />
  );
};

AutoCompleteInput.defaultProps = blockDefaultProps;

export default AutoCompleteInput;
