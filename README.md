# toosimple

Yet another simple-http-server

# Features

- Modern UI
- Small in size: `< 1M` with all dependencies.

# How to use

```bash
$ npm install -g toosimple

$ toosimple
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

- change ecstatic to [serve-static](), it's smaller.
- webapp with history API, when JS is available
- upload

#### License

MIT
