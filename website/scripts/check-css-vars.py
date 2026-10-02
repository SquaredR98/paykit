import io, re, glob, os, sys

os.chdir(r'A:\products\payments\paykit\website')

# Variables DEFINED: globals.css declarations + next/font `variable:` names
defined = set()
g = io.open('app/(main)/globals.css', encoding='utf-8').read()
defined |= set(re.findall(r'^\s*(--[a-z0-9-]+)\s*:', g, re.M))
lay = io.open('app/(main)/layout.tsx', encoding='utf-8').read()
defined |= set(re.findall(r"variable:\s*'(--[a-z0-9-]+)'", lay))

# Variables CONSUMED in globals.css + every v2 component stylesheet
# v2 trees only. components/{blog,demo,docs,contact,workbench,shared} and any
# */old/ are v1 — they reference app/globals.css tokens, not these.
V2_DIRS = ('components/shell', 'components/ui', 'components/homepage')
files = ['app/(main)/globals.css']
for d in V2_DIRS:
    for f in glob.glob(d + '/**/styles.css', recursive=True):
        if '/old/' not in f.replace(os.sep, '/'):
            files.append(f)

used = {}
for f in files:
    s = io.open(f, encoding='utf-8').read()
    for m in re.findall(r'var\((--[a-z0-9-]+)', s):
        used.setdefault(m, set()).add(f)
    # Tailwind v4 arbitrary-token syntax: bg-(--tok) / text-(--tok) / bg-(image:--tok)
    for m in re.findall(r'-\((?:image:)?(--[a-z0-9-]+)\)', s):
        used.setdefault(m, set()).add(f)

missing = {k: v for k, v in used.items() if k not in defined}
print('defined: %d   used: %d' % (len(defined), len(used)))
if missing:
    print('\n*** UNDEFINED VARIABLES ***')
    for k in sorted(missing):
        for f in sorted(missing[k]):
            print('  %-28s used in %s' % (k, f))
    sys.exit(1)
print('\nAll consumed variables are defined.')
