/* @flow */

import { translate } from './messages';

describe('translate function', () => {
  it('should return key when undefined messages', () => {
    expect(translate('{key}')).toEqual('{key}');
  });

  it('should return key when defined messages but value not found', () => {
    expect(translate('{key}', {})).toEqual('{key}');
  });

  it('should return value when defined messages and value found', () => {
    // given
    const messages = {
      category: {
        key: 'value',
      },
    };
    // when-then
    expect(translate('{category.key}', messages)).toEqual('value');
  });

  it('should return value when defined messages but not a key', () => {
    // given
    const messages = {
      category: {
        key: 'value',
      },
    };
    // when-then
    expect(translate('category.key', messages)).toEqual('category.key');
  });
});
