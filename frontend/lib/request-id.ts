export function createRequestId(): string {
  return `req_${crypto.getRandomValues(new Uint32Array(4)).join('')}`;
}
