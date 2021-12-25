# prettier-docker-ga

Run prettier on your code from Github workflows.

Sample Github workflow (this assumes there is a `prettier.config.js` file in your repository):

```yaml
name: Check & fix styling (prettier)

on:
  push:

jobs:
  prettier:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        with:
          ref: ${{ github.head_ref }}

      - name: Run prettier
        uses: permafrost-dev/prettier-docker-ga@main
        with:
          args: --config prettier.config.js ./src

      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: Fix styling
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Patrick Organ](https://github.com/patinthehat)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
