<div align="center">
<h1>pragmatic-drag-and-drop-tree 🏝️</h1>

<p>An off-the-shelf drag-and-drop tree component for React built with <a href="https://github.com/atlassian/pragmatic-drag-and-drop">pragmatic-drag-and-drop</a>.</p>
</div>

---

[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]

> **Warning**
> This library is in early development and may not be production ready. Please give it a try and provide your feedback in the issues.

## The problem

Pragmatic drag and drop is an excellent library for building drag and drop interfaces, and although it has native support for tree structures, it requires a lot of boilerplate code to implement and many of the provided examples make use of Atlassian's Atlaskit design system which may not always be desirable. The base components also lack some needed features, such as [drag restrictions](https://github.com/atlassian/pragmatic-drag-and-drop/issues/49).

## This solution

This library provides a React wrapper component that works out-of-the-box with minimal configuration, provides examples for common use cases, and allows aims to be headless so that it can be styled using your favorite CSS or CSS-in-JS library.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Props](#props)
  - [Examples](#examples)
  - [Known Issues](#known-issues)
- [Other Solutions](#other-solutions)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
- [Contributors ✨](#contributors-)
- [LICENSE](#license)

## Installation

This module is distributed via [npm][npm] which is bundled with [bun][bun] and
should be installed as one of your project's `dependencies`:

```
npm install pragmatic-drag-and-drop-tree
```

## Usage

```tsx
import SortableTree from 'pragmatic-drag-and-drop-tree';

const data = [
  {
    data: {anything: 'you want here'},
    id: '1',
    items: [
        {
            id: '1a',
            data: {anything: 'you want here'},
        }
    ]
  },
  {
    data: {anything: 'you want here'},
    id: '2'
  }
];

const SomeComponent = () => (
  <SortableTree
    items={items}
    onDrop={({instruction, source, target}) => {
        // Update your tree data here in local state, or send a request to your backend API
    }}
    onExpandToggle={({isOpen, item}) => {
        // Mutate your `items` data state here to set an `isOpen` property
    }}
    renderRow={({item}) => <div>{item.id}</div>}
  >
    {({ children, containerRef }) => (
      <ol ref={containerRef}>
        {children}
      </ol>
    )}
  </SortableTree>
);
```

## Props

Documentation coming soon.

### Examples

You can check the working examples in the `/examples` folder.

To run the examples, check out this repositotyr, run `bun i` to install dependencies, and then running `bun dev` to start a local server.

### Known Issues

- None known yet. Feel free to open an issue.

## Other Solutions

- Use the official `pragmatic-drag-and-drop` library documentation for building tree components ([link](https://atlassian.design/components/pragmatic-drag-and-drop/examples#tree))

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][enhancements]

## Contributors ✨

Thanks goes to these people:

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://haus.gg"><img src="https://avatars.githubusercontent.com/u/226640?v=3?s=100" width="100px;" alt="Ev Haus"/><br /><sub><b>Ev Haus</b></sub></a></td>
    </tr>
  </tbody>
</table>

## License

MIT

> [!WARNING]
> `pragmatic-drag-and-drop` is licensed under the [Apache 2.0 license](https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/LICENSE).

[npm]: https://www.npmjs.com
[bun]: https://bun.sh
[package]: https://www.npmjs.com/package/pragmatic-drag-and-drop-tree
[npmtrends]: https://www.npmtrends.com/pragmatic-drag-and-drop-tree
[version-badge]: https://img.shields.io/npm/v/pragmatic-drag-and-drop-tree.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/pragmatic-drag-and-drop-tree.svg?style=flat-square
[bugs]: https://github.com/EvHaus/pragmatic-drag-and-drop-tree/issues?q=is%3Aopen+is%3Aissue+label%3Abug
[enhancements]: https://github.com/EvHaus/pragmatic-drag-and-drop-tree/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement
[good-first-issue]: https://github.com/EvHaus/pragmatic-drag-and-drop-tree/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22
