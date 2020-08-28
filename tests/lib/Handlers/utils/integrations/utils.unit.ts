import { expect } from 'chai';
import sinon from 'sinon';

import { CUSTOM_API, GOOGLE_SHEETS, ZAPIER } from '@/lib/Handlers/utils/integrations/constants';
import { _replacer, deepVariableSubstitution, resultMappings } from '@/lib/Handlers/utils/integrations/utils';

describe('handlers integrations utils unit tests', () => {
  describe('resultMappings', () => {
    describe('GOOGLE_SHEETS', () => {
      it('no mappings', () => {
        const resultData = { foo: 'bar' };
        expect(resultMappings[GOOGLE_SHEETS]({} as any, resultData as any)).to.eql({});
      });

      it('with mappings', () => {
        const resultData = { _cell_location: { row: 'val1' }, foo: 'val2' };
        const node = {
          action_data: {
            mapping: [
              { arg1: 'row_number', arg2: 'var1' },
              { arg1: 'foo', arg2: 'var2' },
            ],
          },
        };
        expect(resultMappings[GOOGLE_SHEETS](node as any, resultData as any)).to.eql({ var1: 'val1', var2: 'val2' });
      });
    });

    it('CUSTOM_API', () => {
      const resultData = { foo: 'bar' };
      expect(resultMappings[CUSTOM_API](null as any, resultData as any)).to.eql(resultData);
    });

    it('ZAPIER', () => {
      expect(resultMappings[ZAPIER](null as any, null as any)).to.eql({});
    });
  });

  describe('_replacer', () => {
    it('inner not in variablesMap', () => {
      const match = 'matched';
      expect(_replacer(match, 'random', {})).to.eql(match);
    });

    it('uriEncode false', () => {
      expect(_replacer('', 'foo', { foo: 'bar' })).to.eql('bar');
    });

    it('uriEncode true', () => {
      const url = 'https://www.domain.com?q=a b c';
      expect(_replacer('', 'foo', { foo: url }, true)).to.eql(encodeURI(url));
    });
  });

  describe('deepVariableSubstitution', () => {
    it('works', () => {
      const bodyData = { url: '{url}', var1: 'val1' };
      const variableMap = { url: 'www.domain.com?q=a b c' };

      expect(deepVariableSubstitution(bodyData, variableMap)).to.eql({ url: encodeURI(variableMap.url), var1: 'val1' });
    });
  });
});
