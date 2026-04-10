import { type Model } from 'messageformat';

export function isInteresting(parsed: Model.Message) : boolean {
  // As a heuristic, we return true if either this is a complex message,
  // or it contains at least one Expression.
  if (parsed.type == 'select')
    return true;
  // Message is a PatternMessage
  // If it has declarations, it's a complex message
  if (parsed.declarations.length > 0)
    return true;
  if (parsed.pattern.some((part: string | Model.Expression | Model.Markup) =>
    typeof(part) === 'object' && part.type === "expression"))
    return true;
  return false;
}
