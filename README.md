# ETF Matcher

Source code for up and coming [ETFMatcher.com](https://etfmatcher.com).

## Requirements

- A Unix terminal shell (such as Bash or Zsh)
- Docker version 26.1.3 (may work with earlier versions of Docker)
- Data (data is not provided directly in this open-source repo; you may need to mock it yourself)
- A compatible .env file (no documentation provided on what to use for this)

### Optional

- make (utility) - Helpful.

You can skip using Docker altogether if that's your thing, but it will be harder to build.

## Development

```bash
make build-dev
make start-dev
```

Other development commands are available by running:

```bash
make help # Or just `make`
```

## Deployment

```bash
make build-prod
```

Built artifacts will be written to `{project_root}/dist`.

## Platform Testing

<div style="background-color: #fff">
<a href="https://www.browserstack.com" target="_blank"><img src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" alt="BrowserStack" width="320"></a>
</div>

Thanks to [BrowserStack Open-Source Program](https://www.browserstack.com/open-source) for providing us with a free account which lets us test on real devices and operating systems.

## License

[MIT License](LICENSE) (c) 2024 Jeremy Harris.
