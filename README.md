## Dependencies

  - A Unix terminal shell (such as Bash or Zsh)
  - make (utility)
  - Docker version 26.1.3 (may work with earlier versions of Docker)
  - Data (data is not provided directly in this open-source repo; you may need to mock it yourself.)
  - A compatible .env file (no documentation provided on what to use for this)

You can skip using Docker altogether if that's your thing, but it will be harder to build. The [docker_build_helpers directory](docker_build_helpers) has various utilities related to encrypting the data in the build, related to licensing conditions.

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
