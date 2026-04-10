import { type Model as MF } from 'messageformat';
import { AssertionError } from './assert.js';

// FIXME: this is copied/pasted from the messageformat-validator-js package
function isPluralSelector(message: MF.Message,
                          variable: MF.VariableRef) : boolean {
   // Check if this variable's RHS has a `:number` annotation.
   const decls = message.declarations;
   for (var decl of decls) {
     if (decl.name == variable.name) {
         const rhs: MF.Expression = decl.value;
         if (rhs.functionRef === undefined || rhs.functionRef === null) {
            // Also need to handle aliasing: we could have
             // .local $x = {$y} where $y has a selector annotation
             if (rhs.arg !== undefined && rhs.arg.type === 'variable') {
               return isPluralSelector(message, rhs.arg);
             } else {
             // RHS must be an unannotated literal
               return false;
             }
         }
         if (rhs.functionRef !== undefined && rhs.functionRef.type === 'function') {
           return rhs.functionRef.name === 'number';
         }
         // This means `variable`'s RHS has an annotation that isn't the plural
         // selector/formatter
         return false;
    }
  }
  // Variable is unbound, which means there's an "unresolved variable" error
  // in the message, but we ignore it
  return false;
}

function makeVariant(catchallVariant: MF.Variant, category: string) : MF.Variant {
  return {...catchallVariant, keys: [{ type: 'literal', value: category }]};
}

function findCatchallVariant(variants: MF.Variant[]) : MF.Variant {
  const possibleVariants: MF.Variant[] = variants.filter((v: MF.Variant) => v.keys.length === 1 && v.keys[0].type === '*');
  if (possibleVariants.length !== 1)
    throw new AssertionError("couldn't find unique * variant in message");
  return possibleVariants[0];
}

export function expandPlurals(message: MF.Message, sourceLocale: string, targetLocale: string) : MF.Message {
  if (message.type !== 'select')
    return message;
  // For now, handle matches with only one selector. FIXME.
  if (message.selectors.length !== 1)
    return message;
  if (!isPluralSelector(message, message.selectors[0]))
    return message;
  const sourcePluralCategories: string[] = new Intl.PluralRules(sourceLocale).resolvedOptions().pluralCategories;
  const targetPluralCategories: string[] = new Intl.PluralRules(targetLocale).resolvedOptions().pluralCategories;
  // Expansion is only necessary when the source has fewer categories than the target.
  if (sourcePluralCategories.length >= targetPluralCategories.length)
    return message;
  const targetCategoriesNotInSource: string[] = targetPluralCategories.filter((category: string) => !sourcePluralCategories.includes(category));
  const catchallVariant = findCatchallVariant(message.variants);
  const extraVariants: MF.Variant[] = targetCategoriesNotInSource.map((category: string) => makeVariant(catchallVariant, category));
  const newVariants: MF.Variant[] = message.variants;
  extraVariants.forEach((v: MF.Variant) => newVariants.push(v));
  return {...message, variants: newVariants};
}
