import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRS_CLIENT_FLOW_ROUTES, SRS_CLIENT_FLOW_ROUTE_KEYS } from './srs-client-flow-routes.ts';

type Route = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  source: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const appFile = path.join(repoRoot, 'src', 'app.ts');
const reportPath = path.join(repoRoot, 'docs', 'unused-api-report.md');

function normalizePath(basePath: string, routePath: string): string {
  if (basePath === '/health' || routePath === '/health') {
    return '/health';
  }

  const combined = routePath === '/'
    ? basePath
    : `${basePath.replace(/\/$/, '')}/${routePath.replace(/^\//, '')}`;

  return combined.replace(/\/+/g, '/');
}

function classifyUnusedRoute(route: Route): string {
  if (route.path.includes('/cursor')) {
    return 'Cursor/list variant not referenced by the SRS flow document.';
  }
  if (route.path.startsWith('/api/v1/otpTokens') || route.path.startsWith('/api/v1/passwordResetTokens')) {
    return 'Generated token resource endpoint; the documented flows use auth workflow endpoints instead.';
  }
  if (route.path.startsWith('/api/v1/locations')) {
    return 'Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document.';
  }
  if (route.path.startsWith('/api/v1/comments') || route.path.startsWith('/api/v1/reactions')) {
    return 'Generated read/list variant not called explicitly in the documented interaction flows.';
  }
  if (route.method === 'PUT' || route.method === 'PATCH' || route.method === 'DELETE') {
    return 'Live route is available, but this specific variant is not part of the SRS client-flow coverage set.';
  }
  return 'Live route not referenced by the SRS client-flow document.';
}

async function extractLiveRoutes(): Promise<Route[]> {
  const appSource = await fs.readFile(appFile, 'utf8');
  const importEntries = new Map<string, string>();

  for (const match of appSource.matchAll(/import\s+\{\s*(\w+)\s*\}\s+from\s+'([^']+)';/g)) {
    const [, importedName, importPath] = match;
    importEntries.set(importedName, importPath);
  }

  const routes: Route[] = [];
  routes.push({ method: 'GET', path: '/health', source: 'src/app.ts' });

  for (const match of appSource.matchAll(/app\.use\('([^']+)',\s*(\w+)\);/g)) {
    const [, basePath, routerIdentifier] = match;
    const importPath = importEntries.get(routerIdentifier);

    if (!importPath) {
      continue;
    }

    const routeFilePath = path.resolve(path.dirname(appFile), importPath.replace(/\.js$/, '.ts'));
    const routeSource = await fs.readFile(routeFilePath, 'utf8');
    const relativeRouteFilePath = path.relative(repoRoot, routeFilePath);

    for (const routeMatch of routeSource.matchAll(/router\.(get|post|put|patch|delete)\('([^']+)'/g)) {
      const [, method, routePath] = routeMatch;
      routes.push({
        method: method.toUpperCase() as Route['method'],
        path: normalizePath(basePath, routePath),
        source: relativeRouteFilePath,
      });
    }
  }

  return routes
    .filter((route, index, allRoutes) => allRoutes.findIndex((candidate) => candidate.method === route.method && candidate.path === route.path) === index)
    .sort((left, right) => `${left.path}:${left.method}`.localeCompare(`${right.path}:${right.method}`));
}

async function main(): Promise<void> {
  const liveRoutes = await extractLiveRoutes();
  const coveredRoutes = SRS_CLIENT_FLOW_ROUTES
    .slice()
    .sort((left, right) => `${left.path}:${left.method}`.localeCompare(`${right.path}:${right.method}`));
  const unusedRoutes = liveRoutes.filter((route) => !SRS_CLIENT_FLOW_ROUTE_KEYS.has(`${route.method} ${route.path}`));

  const lines: string[] = [
    '# Unused API Report',
    '',
    'This report compares the live Express route surface with the SRS client-flow routes documented in `docs/user-flows.md`.',
    '',
    `Generated on: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Live routes discovered: ${liveRoutes.length}`,
    `- Routes covered by SRS flows: ${coveredRoutes.length}`,
    `- Live routes not covered by SRS flows: ${unusedRoutes.length}`,
    '',
    '## Covered Routes',
    '',
    '| Method | Path | Flow |',
    '|---|---|---|',
    ...coveredRoutes.map((route) => `| ${route.method} | \`${route.path}\` | ${route.reason} |`),
    '',
    '## Unused Live Routes',
    '',
    '| Method | Path | Source | Why It Is Unused |',
    '|---|---|---|---|',
    ...unusedRoutes.map((route) => `| ${route.method} | \`${route.path}\` | \`${route.source}\` | ${classifyUnusedRoute(route)} |`),
    '',
    '## All Live Routes',
    '',
    '| Method | Path | Source | Covered By SRS |',
    '|---|---|---|---|',
    ...liveRoutes.map((route) => {
      const covered = SRS_CLIENT_FLOW_ROUTE_KEYS.has(`${route.method} ${route.path}`) ? 'Yes' : 'No';
      return `| ${route.method} | \`${route.path}\` | \`${route.source}\` | ${covered} |`;
    }),
    '',
  ];

  await fs.writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, reportPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
