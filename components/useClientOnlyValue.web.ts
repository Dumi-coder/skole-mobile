// This web-only helper is used after hydration, so we can return the client value
// directly without triggering a setState-in-effect lint violation.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
