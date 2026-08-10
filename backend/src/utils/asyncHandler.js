export function asyncHandler(handler) {
  return function handleAsyncRequest(req, res, next) {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}
