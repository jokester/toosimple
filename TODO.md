# TODO (features)

- [x] Server-generated file index
    - Like `SimpleHTTPServer` in Python, or `Rack::Directory` in Ruby
- [x] Upload
    - Trivial `<form>` POST
- [ ] HTTPS support
    - Generate self-signed HTTPS cert on the fly
    - Optionally accepts a root cert
- [ ] SPA with browser-side rendering
    - Use AJAX to fetch index & upload file
    - Route
- [ ] File Change Notification
    - Update page when new file is created on server side
    - Maybe with WebSocket
- [ ] Enhanced Test
    - Jest and something

# TODO (minor)

- add an option to enable / disable uploading
- add an option to silently discard uploaded file (for demo purpose)
- add an option to prevent file overwriting
- add an option to disable symlink resoling
- create a logo
- see if webpack2 treeshake can reduce module size `--module ES6` (not likely though)
- add an option to specify URL root
- extract HTML indexing as a service
- export as a library (for what?)
- can we upload a directory?
- better console output: available IPs, access logs, etc
- permission / authentication
- serve assets from local instead of CDN

- SPA to serve index faster (Preact / History API)
    - download/upload with javascript for smoothness
    - webapp with history API, when JS is available

# FIXME

- clean consecutive '/' in URL path
- mv/cp should not attempt to save dir
