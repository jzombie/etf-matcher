## Dependencies

  - Docker version 26.1.3 (may work with earlier versions of Docker).
  - A Unix terminal shell (such as Bash or Zsh)

You can skip using Docker altogether if that's your thing, but it will be harder to build.

_Note: If using the Docker environment, an .env file will be [automatically generated](docker_build_helpers/generate_env.sh)._

## Development

```bash
$ make build-dev
$ make start-dev
```

Other development commands are available by running:

```bash
$ make help # Or just `make`
```

## Deployment

```bash
$ make build-prod
```

Built artifacts will be written to `{project_root}/dist`.
