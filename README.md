# toosimple

Yet another simple-http-server

[![npm version](https://badge.fury.io/js/toosimple.svg)](https://www.npmjs.com/package/toosimple)

# Features

- Modern UI
- Small in size: around `1.5M` with all dependencies.

# Screenshot

![https://github.com/jokester/toosimple/raw/master/screenshot.png](https://github.com/jokester/toosimple/raw/master/screenshot.png)

# How to use

```bash
$ npm install -g toosimple

$ toosimple
listening with options: {"root":"/home/me/somewhere/","port":11131,"bind":"0.0.0.0"}

// open "localhost:11131" in browser to see it
```

# Command Line Options

```
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

# TODO

- upload (working)
- better console output: available IPs, access logs, etc
- permission / authentication
- serve assets from local instead of CDN
- webapp with history API, when JS is available


#### License

MIT
