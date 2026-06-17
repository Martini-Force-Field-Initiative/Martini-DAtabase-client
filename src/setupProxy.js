// Dev-server proxy for the socket.io connection.
//
// Why this file exists:
//   The package.json `"proxy": "http://web:80"` field is handled by CRA via
//   react-dev-utils, whose context heuristic only proxies a GET request when it
//   carries an `Accept` header without `text/html`:
//
//     req.method !== 'GET' ||
//     (mayProxy(pathname) && req.headers.accept &&
//       req.headers.accept.indexOf('text/html') === -1)
//
//   A socket.io websocket UPGRADE is a GET with `Connection: Upgrade` and no
//   `Accept` header, so it fails that test and is never proxied — despite
//   `ws: true`. socket.io then can't upgrade and falls back to HTTP long-polling,
//   where every message is a fresh XHR round-trip through the proxy. That is the
//   dev-only latency we observe on the socket connection.
//
// This middleware runs in the dev server's `before` hook (ahead of the
// package.json proxy), matches `/socket.io` by PATH (no Accept heuristic), and
// enables `ws: true`, so the websocket upgrade is proxied correctly. REST calls
// continue to flow through the unchanged package.json `proxy` field.
//
// Note: react-scripts 4 ships http-proxy-middleware v0.19, whose default export
// is the factory itself (the createProxyMiddleware named export arrives in v1).
const proxy = require("http-proxy-middleware");

const TARGET = "http://web:80";

module.exports = function (app) {
  app.use(
    proxy("/socket.io", {
      target: TARGET,
      ws: true, // proxy the websocket upgrade, not just the polling handshake
      changeOrigin: true,
      logLevel: "warn",
    }),
  );
};
