type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

type WrappedResponse = {
  buffer: ArrayBuffer;
  init: ResponseInit;
};

const INBOX_COUNTS_PATH = '/v1.0/projects/leads/inbox-counts';

const isInboxCountsRequest = (input: FetchInput): boolean => {
  try {
    if (typeof input === 'string') {
      return input.includes(INBOX_COUNTS_PATH);
    }
    if (input instanceof URL) {
      return input.pathname.endsWith(INBOX_COUNTS_PATH);
    }
    if (input instanceof Request) {
      const url = new URL(input.url);
      return url.pathname.endsWith(INBOX_COUNTS_PATH);
    }
  } catch {
    // ignore
  }
  return false;
};

const getMethod = (input: FetchInput, init?: FetchInit) => {
  if (init?.method) {
    return init.method.toUpperCase();
  }
  if (input instanceof Request) {
    return input.method.toUpperCase();
  }
  return 'GET';
};

const getRequestKey = (input: FetchInput): string => {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  if (input instanceof Request) {
    return input.url;
  }
  return String(input);
};

const normalizeHeaders = (headers: HeadersInit | undefined) => {
  if (!headers) {
    return new Headers();
  }
  return headers instanceof Headers ? headers : new Headers(headers);
};

const getDedupeKey = (input: FetchInput, init?: FetchInit) => {
  const url = getRequestKey(input);
  const headers = normalizeHeaders(init?.headers);
  const requestHeaders = input instanceof Request ? input.headers : undefined;
  const merged = new Headers(requestHeaders);
  headers.forEach((value, key) => merged.set(key, value));

  const auth = merged.get('authorization') ?? '';
  const projectId = merged.get('x-project-id') ?? '';

  return `${url}::auth=${auth}::project=${projectId}`;
};

const cloneHeaders = (headers: Headers) => {
  const cloned = new Headers();
  headers.forEach((value, key) => cloned.set(key, value));
  return cloned;
};

let installed = false;

export const installInboxCountsFetchDedupe = () => {
  if (installed) {
    return;
  }
  installed = true;

  const originalFetch = window.fetch.bind(window);
  const inFlight = new Map<string, Promise<WrappedResponse>>();

  window.fetch = async (input: FetchInput, init?: FetchInit) => {
    if (!isInboxCountsRequest(input) || getMethod(input, init) !== 'GET') {
      return originalFetch(input, init);
    }

    const signal = init?.signal;
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const key = getDedupeKey(input, init);
    const existing = inFlight.get(key);
    if (existing) {
      const { buffer, init: responseInit } = await existing;
      return new Response(buffer.slice(0), responseInit);
    }

    const started = (async (): Promise<WrappedResponse> => {
      try {
        const response = await originalFetch(input, init);
        const buffer = await response.arrayBuffer();
        const responseInit: ResponseInit = {
          status: response.status,
          statusText: response.statusText,
          headers: cloneHeaders(response.headers),
        };
        return { buffer, init: responseInit };
      } finally {
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, started);
    const { buffer, init: responseInit } = await started;
    return new Response(buffer.slice(0), responseInit);
  };
};
