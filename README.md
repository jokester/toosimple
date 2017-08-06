# toosimple

<!-- TODO logo -->

Yet another simple-http-server to host static files.

[![npm version](https://badge.fury.io/js/toosimple.svg)](https://www.npmjs.com/package/toosimple)

# Features

- Modern UI
- Small in size: around `2M` with all dependencies.

# Screenshot

![https://github.com/jokester/toosimple/raw/master/screenshot.png](https://github.com/jokester/toosimple/raw/master/screenshot.png)

# How to use

```text
$ npm install -g toosimple
$ toosimple
toosimple: server started
  root: /home/me/
Web UI is available at the following URLs:
  URL #1: http://[::1]:11131/
  URL #2: http://127.0.0.1:11131/
  URL #3: http://[fe80::1]:11131/
  URL #4: http://[fe80::f65c:89ff:fea2:928d]:11131/
  URL #5: http://192.168.2.203:11131/
  URL #6: http://[2408:213:4b:7d00:f65c:89ff:fea2:928d]:11131/
  URL #7: http://[2408:213:4b:7d00:ec4a:538:4a8c:ea0e]:11131/
  URL #8: http://[fe80::d84e:d6ff:fe1b:f28b]:11131/

// open "http://127.0.0.1:11131/" in browser to see it
```

# Command Line Options

```
$ toosimple -h
usage: toosimple [-h] [-v] [-r PATH] [-p PORT] [-b IP]

toosimple: Yet another simple-http-server

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -r PATH, --root PATH  root of files, defaults to $PWD
  -p PORT, --port PORT  http/https port to listen at. Defaults to 11131
  -b IP, --bind IP      Network interface to serve on. Defaults to 0.0.0.0 /
                        all interfaces.
```

# Why another simple-http-server?

It is a intended overkill: I wanted to see how a static file server performs,
after enhanced by "modern" technologies (SPA, server-push, etc).

#### License

MIT
