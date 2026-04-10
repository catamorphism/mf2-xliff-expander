#  Library for Unicode MessageFormat messages stored in XLIFF files

Currently, this library exports a single function `expandxliff` that does two things:
1. Parses `source` as XLIFF and expands any messages inside <source> tags that appear to be Unicode
MessageFormat messages into XLIFF format, and returns the resulting XLIFF document.
2. Within the MessageFormat messages, expands plurals: if locales are passes as arguments to `expandxliff`,
extra variants are added to correspond to plural categories existing in the target language but not the source
language.

# Usage

npm run build && npm run test
