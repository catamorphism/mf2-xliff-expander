import { stringify } from '@messageformat/xliff';
import { expandxliff } from './index.ts';

test('plural expansion, English to Russian', () => {
  // FIXME: the notes should be inserted automatically according to CLDR data:
  /*
      <notes>
        <note appliesTo="source" id="en-one">Values: 1</note>
        <note appliesTo="source" id="en-other">Values: 0, 2-16, 100, 1000, …</note>
        <note appliesTo="target" id="ru-one">Values: 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, …</note>
        <note appliesTo="target" id="ru-few">Values: 2~4, 22~24, 32~34, 42~44, 52~54, 62, 102, 1002, …	</note>
        <note appliesTo="target" id="ru-many">Values: 0, 5~19, 100, 1000, 10000, 100000, 1000000, …	</note>
        <note appliesTo="target" id="ru-other">Values: 0.0~1.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0,…</note>
      </notes>
   */
  const xliff = `<?xml version="1.0" encoding="utf-8"?>
<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" srcLang="en" trgLang="es-US" version="2.0" xsi:schemaLocation="xliff_core_2.0.xsd" xmlns="urn:oasis:names:tc:xliff:document:2.0">
  <file id="C4567">
    <unit id="L12345">
      <segment id="one">
        <source>
.input {$count :number}
.match $count
one {{You have {$count} security.}}
  * {{You have {$count} securities.}}
        </source>
      </segment>
      <segment id="two">
        <source xml:space="preserve">
          Not MF2, don't touch
        </source>
      </segment>
    </unit>
  </file>
</xliff>`;
  const xliff_expanded = stringify(expandxliff(xliff, "en", "ru"));
  expect(xliff_expanded).toBe(
    `<?xml version="1.0" encoding="utf-8"?>
<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" srcLang="en" trgLang="es-US" version="2.0" xsi:schemaLocation="xliff_core_2.0.xsd" xmlns="urn:oasis:names:tc:xliff:document:2.0">
  <file id="C4567">
    <unit id="L12345">
      <res:resourceData>
        <res:resourceItem id="count" mf:declaration="input">
          <res:source>
            <mf:variable name="count"/>
            <mf:function name="number"/>
          </res:source>
        </res:resourceItem>
      </res:resourceData>
      <segment id="s:msg:one">
        <source xml:space="preserve">You have <ph id="1" mf:ref="count"/> security.</source>
      </segment>
      <segment id="s:msg:_other">
        <source xml:space="preserve">You have <ph id="2" mf:ref="count"/> securities.</source>
      </segment>
      <segment id="s:msg:few">
        <source xml:space="preserve">You have <ph id="3" mf:ref="count"/> securities.</source>
      </segment>
      <segment id="s:msg:many">
        <source xml:space="preserve">You have <ph id="4" mf:ref="count"/> securities.</source>
      </segment>
      <segment id="two">
        <source xml:space="preserve">
          Not MF2, don't touch
        </source>
      </segment>
    </unit>
  </file>
</xliff>`
  );

});
