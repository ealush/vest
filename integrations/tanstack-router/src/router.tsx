import {
  Outlet,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { enforce } from 'vest';

export const searchSchema = enforce.shape({
  page: enforce.isNumeric().isPositive().toNumber(),
  query: enforce.isString().trim(),
});

const rootRoute = createRootRoute({ component: Outlet });

export const searchRoute = createRoute({
  component: SearchPage,
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: searchSchema,
});

function SearchPage() {
  const search = searchRoute.useSearch();
  return <pre>{JSON.stringify(search, null, 2)}</pre>;
}

const routeTree = rootRoute.addChildren([searchRoute]);

export function createSearchRouter(initialEntry: string) {
  return createRouter({
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    routeTree,
  });
}

export async function loadSearch(initialEntry: string) {
  const router = createSearchRouter(initialEntry);
  const matches = router.matchRoutes(router.latestLocation);
  const match = matches.at(-1);
  if (match?.searchError) throw match.searchError;
  return match?.search;
}
