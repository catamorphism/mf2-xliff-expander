import type * as X from '@messageformat/xliff';

function mapSegment(transform: (s: X.Source) => (X.Unit | X.Source)) : (x: X.Segment) => (X.Segment | X.Unit) {
  return (x: X.Segment) => {
    if (x.elements.length < 2) {
       const result: X.Unit | X.Source = transform(x.elements[0]);
       if (result.name === 'unit')
         return result;
       return {...x, elements: [result]};
    // FIXME: ignore when a target is present
    }
    return x;
  };
}

function mapUnit(transform: (s: X.Source) => X.Unit | X.Source) : (x: X.Unit) => X.Unit {
  return (x: X.Unit) => {
    if (x.elements) {
      const newElements: any[] = [];
      x.elements.forEach((element) => {
        if (element.name === 'segment') {
          const segment: X.Segment = element as X.Segment;
          const result: X.Segment | X.Unit = (mapSegment(transform)(segment));
          if (result.name === 'segment')
            newElements.push(result);
          else {
            if (result.elements)
              result.elements.forEach((element) => newElements.push(element));
          }
        } else
          newElements.push(element);
      });
      const result: X.Unit = {...x, elements: newElements };
      return result;
    } else {
      return x;
    }};
}

function mapFile(transform: (s: X.Source) => X.Unit | X.Source) : (x: X.File) => X.File {
  return (x: X.File) => {
    return {...x, elements: x.elements.flatMap((element: any) => {
      if (element.name === "unit") {
        const elementAsUnit: X.Unit = element as X.Unit;
        return mapUnit(transform)(elementAsUnit);
      } else {
        return element;
      }})}};
}

function mapXliff(transform: (s: X.Source) => X.Unit | X.Source) : (x: X.Xliff) => X.Xliff {
  return (x: X.Xliff) => { return {...x, elements: x.elements.map(mapFile(transform)) } };
}

function mapElements(doc: X.XliffDoc, transform: (x: X.Xliff) => X.Xliff) : X.XliffDoc {
  return {...doc, elements: [transform(doc.elements[0])]};
}

export function mapXliffDoc(doc: X.XliffDoc, transform: (s: X.Source) => X.Unit | X.Source) : X.XliffDoc {
  return mapElements(doc, mapXliff(transform));
}
