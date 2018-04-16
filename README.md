# Timestamper

![Timestamper](https://raw.githubusercontent.com/jrmykolyn/sfco-timestamper/master/timestamper.gif)

## Table of Contents
- [About](#about)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
	- [Contibuting Overview](#contributing-overview)
	- [Code Style](#code-style)
	- [Testing](#testing)
- [Attribution](#attribution)


## About
Do you lose sleep over the thought of going a day without contributing to a repo? Does the thought of seeing a blank square on your GitHub contribution grid fill you with existential dread? If so, Timestamper is for you! With a single command, Timestamper adds and commits a meaningless update to a predetermined repository.

Is midnight approaching and you haven't made any contributions today? Not a problem, simply invoke the `timestamper` command and rest easy knowing that your contribution grid will remain a sea of competent green (just hope that no one looks too closely at *what* in particular you're contributing).

## Installation
```
npm install --g sfco-timestamper
```

Once installed, the `timestamper` command becomes globally available.

## Setup
`timestamper` requires a repository (`repoPath`) and target file (`dumpFile`) in order to work correctly.

By default, `timestamper` will attempt to find/update `timetamper-dump/DUMP.md` in the current user's home directory. In order to provide alternative values for the `repoPath` and/or the `dumpFile`, invoke `timestamper --init` and follow the instructions provided.

Please note that the folder located at `repoPath` must be a git repository.

## Usage

**Initialization**

To create a configuration file, invoke `timestamper --init`.

```
$ timestamper --init // Creates a configuration file at ~/.config/configstore/sfco-timestamper.json
```

**Default**

After the module has been initialization and configured, invoke the `timestamper` command to add a commit to the target repo.

```
$ timestamper // Updates and commits <repoPath>/<dumpFile>
```

**Force**

By default, `timestamper` can only be invoked once a day. However, additional commits may be added by invoking `timestamper --force`.

```
$ timestamper --force // Adds and commits additional updates to <repoPath>/<dumpFile>
```

## Documentation
Currently, Timestamper *does not* include any external documentation.

For an overview of the project's evolution, please consult the `CHANGELOG`.

## Contributing

### Contributing Overview
Issues and proposed enhancements are welcome!

### Code Style
`ESlint` and `editorconfig` are used to enforce consistent code style and formatting. Please ensure that both of these tools are available within your IDE.

### Testing
Whoops, Timestamper doesn't ship with any tests. Want to add some? Spin up an [issue](https://github.com/jrmykolyn/sfco-timestamper/issues)!.

## Attribution
- `README.md` gif: https://giphy.com/gifs/halloween-ghost-ghosts-Yph6D7zPIVtIc
