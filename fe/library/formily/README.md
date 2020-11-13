- JSON Schema:

```js
import { SchemaForm } from 'formily/next'
import { Input, Radio } from 'antd'

const components = {
  Input, Radio
}
const schema = {
  type: 'object',
  properties: {
    field0: {
      title: 'this is input',
      'x-component': 'Input',
      'x-component-props': {
        style: {border: '1px solid red'}
      }
    },
    {
      key: 'radio',
      title: 'this is radio',
      'x-component': 'radio',
      'x-component-props': {
        options: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
        ],
      },
    },
  }
}

const App = () => (
  <SchemaForm components={components} schema={schema} />
)
```

- 联动:

```js
import { SchemaForm, FormEffectHooks } from 'formily/next';

const { onFieldChange$ } = FormEffectHooks;

const App = () => (
  <SchemaForm
    components={components}
    schema={schema}
    effects={(_, { setFieldState }) => {
      onFieldChange$('fieldName', (fieldState) => {
        const { value } = fieldState;
        // some check by value
        setFieldState('anotherFieldName', (state) => {
          // example
          state.visible = xxx;
        });
      });
    }}
  />
);
```

- 布局：
  - 包一层 Layout(`type: object为no name field`)

* 校验：
  - 同步校验
  - 异步校验(`x-props.triggerType='onBlur'` 防止过度触发)
  - 联动协议

```js
const schema = {
  type: 'object',
  properties: {
    motherfuckerField: {
      required: true,
      'x-rules': (value) => {
        return {
          type: 'success' | 'warning' | 'error',
          message: 'fuck you, bitch',
        };
      },
    },
  },
};
```
