import type * as X from '@messageformat/xliff';
import { mf2xliff, parse, type MessageFormatInfo } from '@messageformat/xliff';
import { type Model as MF, parseMessage } from 'messageformat';
import { AssertionError } from './assert.js';
import { isInteresting } from './detectmf2.js';
import { mapXliffDoc } from './mapxliff.js';
import { expandPlurals } from './pluralexpansion.js';

/*
function forEachFile(doc: X.XliffDoc, handle: (f: X.File) => void) {
  doc.elements.forEach((element: X.Element) => {
    if (element.name === "xliff") {
      if (element.elements) {
        element.elements.forEach((innerElement: X.Element | X.Text, _index: number, _array: (X.Element | X.Text)[]) => {
          if (innerElement.type === 'element' && innerElement.name === "file")
            handle(innerElement as X.File);
        })};
      }});
}

function forEachUnit(file: X.File, handle: (u: X.Unit) => void) {
  file.elements.forEach((element) => {
    if (element.name === "unit")
      handle(element);
  });
}

function forEachSegment(unit: X.Unit, handle: (s: X.Segment) => void) {
  if (unit.elements) {
    unit.elements.forEach((element) => {
      if (element.name === "segment")
        handle(element);
    });
  }
}

function forEachSource(segment: X.Segment, handle: (s: X.Source) => void) {
  segment.elements.forEach((element) => {
    if (element.name === "source")
      handle(element);
  });
}

function forEachText(source: X.Source, handle: (s: string) => void) {
  source.elements.forEach((element) => {
    if (element.type === "text")
      handle(element.text);
  });
}
*/

/*
export function expandxliff(
  source: string
): X.XliffDoc {
  const parsed: X.XliffDoc = parse(source);
  forEachFile(parsed, (file) =>
    forEachUnit(file, (unit) =>
      forEachSegment(unit, (segment) =>
        forEachSource(segment, (source) =>
          forEachText(source, (text) => {
            if (isMF2(text))
              console.log(`${text} is MF2`);
            else
              console.log(`${text} is not MF2`);
          })))));
  return parsed;
}
*/

function findUnit(x: X.Xliff) : X.Unit {
  // Assumes there is exactly one unit
  if (x.elements.length === 1) {
    if (x.elements[0].name === 'file') {
      const f: X.File = x.elements[0];
      if (f.elements.length === 1) {
        if (f.elements[0].name === 'unit')
          return f.elements[0];
      }
    }
  }
  throw new AssertionError("findUnit: x has the wrong form");
}

function parseMf2InText(s: string, sourceLocale?: string, targetLocale?: string) : X.Text | X.Unit {
  let parsed: MF.Message;
  try {
    parsed = parseMessage(s);
  } catch(e) {
    // Not MF2
    return { type: 'text', text: s };
  }
  if (!isInteresting(parsed))
    return { type: 'text', text: s };
  if (sourceLocale && targetLocale)
    parsed = expandPlurals(parsed, sourceLocale, targetLocale);
  const data = new Map<string, MF.Message>([
    ['msg', parsed]
  ]);
  // FIXME: Get id and locale from elsewhere
  const source: MessageFormatInfo = { data, id: 'res', locale: 'en' };
  const xliff: X.Xliff = mf2xliff(source);
  return findUnit(xliff);
}

function parseMf2InSource(sourceLocale?: string, targetLocale?: string) : (s: X.Source) => X.Unit | X.Source {
  return (s: X.Source) => {
    // Look for something like: <source> ...message text... </source>
    if ((s.elements.length != 1) || (s.elements[0].type !== "text"))
      return s;
    const result: X.Text | X.Unit = parseMf2InText(s.elements[0].text, sourceLocale, targetLocale);
    if (result.type === 'text')
      return {...s, elements: [result]};
    return result as X.Unit;
  }
}

export function expandxliff(
  source: string,
  sourceLocale?: string,
  targetLocale?: string
): X.XliffDoc {
  const parsed: X.XliffDoc = parse(source);
  return mapXliffDoc(parsed, parseMf2InSource(sourceLocale, targetLocale));
}
