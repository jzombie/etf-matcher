## Dependencies

  - Docker version 26.1.3 (may work with earlier versions of Docker).
  - A Unix terminal shell (such as Bash or Zsh)

_Note: If using the Docker environment, a .env file will be [automatically generated](docker_build_helpers/generate_env.sh)._

You can skip using Docker altogether if that's your thing, but it will be harder to build. The [docker_build_helpers directory](docker_build_helpers) has various utilities related to encrypting the data in the build, for various licensing conditions.

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
