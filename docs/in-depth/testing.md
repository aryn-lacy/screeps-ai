# Testing

Automated testing helps prevent regressions and reproduce complex failure
scenarios for bug fixing or feature implementation. This project comes with
support for both unit and integration testing with your Screeps code.

You can read more about [unit and integration testing on
Wikipedia](https://en.wikipedia.org/wiki/Test-driven_development).

This documentation will cover the testing setup for those already familiar with
the process of test driven design.

Tests run on [Vitest](https://vitest.dev/) and are executed only if they include
`.test.ts` in their filename. If you have written a test file but aren't seeing
it executed, this is probably why. There are two separate test commands and
configurations, as unit tests don't need the complete Screeps server run-time
that the optional integration tests do.

## Running Tests

The standard `npm test` executes the unit test suite. This is helpful for CI/CD
and pre-publish checks, however during active development it's better to run
just a subset of interesting tests.

`npm run test-unit` runs the unit suite once; `npm run test-watch` keeps Vitest
running and re-runs affected tests as you edit. Vitest also accepts a filename
filter: `npm run test-unit -- main` runs only the test files whose path matches
`main`.

`npm run test-integration` runs the optional integration suite (see below).
Arguments after `--` are passed to Vitest directly; for example, this runs only
the tests whose name matches `memory`:

```
npm run test-integration -- -t memory
```

## Unit Testing

You can test code with simple run-time dependencies via the unit testing
support. Since unit testing is much faster than integration testing by orders of
magnitude, it is recommended to prefer unit tests wherever possible.

## Integration Testing

### Installing Screeps Server Mockup

Before starting to use integration testing, you must install [screeps-server-mockup](https://github.com/screepers/screeps-server-mockup) to your project.
Please view that repository for more instruction on installation.

```bash
# Using yarn:
yarn add -D screeps-server-mockup
# Using npm
npm install --save-dev screeps-server-mockup
```

The `test-integration` script in `package.json` already builds the project and
runs this suite with Vitest, so once the dependency is installed you can run it
directly:

```bash
npm run test-integration
```

If you want both suites to run together, add it to the `test` script as well.

### Integration Testing with Screeps Server Mockup

Integration testing is for code that depends heavily on having a full game
environment. Integration tests are completely representative of the real game
(in fact they run with an actual Screeps server). This comes at the cost of
performance and very involved setup when creating specific scenarios.

Server testing support is implemented via
[screeps-server-mockup](https://github.com/screepers/screeps-server-mockup). View
this repository for more information on the API.

By default the test helper will create a "stub" world with a 3x3 grid of rooms
with sources and controllers. Additionally it spawns a bot called "player"
running the compiled main.js file from this repository.

It falls on the user to properly set up preconditions using the
screeps-server-mockup API. Importantly, most methods exposed with this API are
asynchronous, so using them requires frequent use of the `await` keyword to get
a result and ensure order of execution. If you find that some of your
preconditions don't seem to take effect, or that you receive a Promise object
rather than an expected value, you're likely missing `await` on an API method.

Finally, please note that screeps-server-mockup, and this repo by extension,
come with a specific screeps server version at any given time. It's possible
that either your local package.json, or the screeps-server-mockup package itself
are out of date and pulling in an older version of the [screeps
server](https://github.com/screeps/screeps). If you notice that test environment
behavior differs from the MMO server, ensure that all of these dependencies are
correctly up to date.
