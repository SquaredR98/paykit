import io, os, re, glob, sys

os.chdir(r'A:\products\payments\paykit\website')

V2 = ['components/shell', 'components/ui', 'components/homepage', 'app/(main)']

def v2_files():
    out = []
    for d in V2:
        for ext in ('tsx', 'ts'):
            for f in glob.glob(d + '/**/*.' + ext, recursive=True):
                if '/old/' not in f.replace(os.sep, '/'):
                    out.append(f)
    return out

files = v2_files()
problems = []

# --- 1. every local @/ import resolves to a real file ---
for f in files:
    s = io.open(f, encoding='utf-8').read()
    for m in re.findall(r"from '(@/[^']+)'", s):
        rel = m[2:]
        cands = [rel + e for e in ('.tsx', '.ts', '/index.tsx', '/index.ts', '.css')]
        if not any(os.path.exists(c) for c in cands):
            problems.append('%s -> unresolved import %s' % (f, m))

# --- 2. every styles.css next to a component is imported by it ---
for css in glob.glob('components/{shell,ui,homepage}/**/styles.css', recursive=True):
    pass
for d in ('components/shell', 'components/ui', 'components/homepage'):
    for css in glob.glob(d + '/**/styles.css', recursive=True):
        if '/old/' in css.replace(os.sep, '/'):
            continue
        folder = os.path.dirname(css)
        imported = False
        for tsx in glob.glob(folder + '/*.tsx'):
            if "'./styles.css'" in io.open(tsx, encoding='utf-8').read():
                imported = True
                break
        if not imported:
            problems.append('%s -> styles.css never imported' % css)

# --- 3. every v2 component folder is reachable from HomepageView/Shell ---
# Route entry points. Next.js special files (page/layout/opengraph-image) are
# reached by the framework, not by an import, so they seed the walk.
roots = ['app/(main)/page.tsx', 'app/(main)/layout.tsx',
         'app/(main)/opengraph-image.tsx']
reached, queue = set(), list(roots)
while queue:
    f = queue.pop()
    if f in reached or not os.path.exists(f):
        continue
    reached.add(f)
    s = io.open(f, encoding='utf-8').read()
    for m in re.findall(r"from '(@/[^']+|\./[^']+)'", s):
        if m.startswith('@/'):
            rel = m[2:]
        else:
            rel = os.path.join(os.path.dirname(f), m[2:]).replace(os.sep, '/')
        for c in (rel + '.tsx', rel + '.ts', rel + '/index.tsx', rel + '/index.ts'):
            if os.path.exists(c):
                queue.append(c)
                break

orphans = [f for f in files
           if f.replace(os.sep, '/') not in {r.replace(os.sep, '/') for r in reached}
           and f.endswith(('.tsx', '.ts'))
           and not f.endswith('.css')]

print('v2 source files : %d' % len(files))
print('reachable       : %d' % len(reached))
if orphans:
    print('\nNOT REACHABLE from the page (dead or not wired):')
    for o in sorted(orphans):
        print('  ' + o)
if problems:
    print('\nPROBLEMS:')
    for p in problems:
        print('  ' + p)
    sys.exit(1)
if not orphans:
    print('\nAll v2 files reachable, all imports resolve, all styles imported.')
