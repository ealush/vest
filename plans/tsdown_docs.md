here are the docs, now do it:

# Benchmark

`tsdown` delivers exceptional performance compared to other popular bundlers. In most cases, it is approximately **2 times faster** than `tsup` for standard builds, and up to **8 times faster** when generating TypeScript declaration files.

For detailed comparisons and real-world results, see [bundler-benchmark](https://gugustinette.github.io/bundler-benchmark/).

# CJS Default Export

The `cjsDefault` option helps improve compatibility when generating CommonJS (CJS) modules. This option is **enabled by default**.

## How It Works

When your module has **only a single default export** and the output format is set to CJS, `tsdown` will automatically transform:

- `export default ...`
  into
  `module.exports = ...` in the generated JavaScript file.

For TypeScript declaration files (`.d.ts`), it will transform:

- `export default ...`
  into
  `export = ...`

This ensures that consumers using CommonJS require syntax (`require('your-module')`) will receive the default export directly, improving interoperability with tools and environments that expect this behavior.

## Example

**Source Module:**

```ts
// src/index.ts
export default function greet() {
  console.log('Hello, world!');
}
```

**Generated CJS Output:**

```js
// dist/index.cjs
function hello() {
  console.log('Hello, world!');
}
module.exports = hello;
```

**Generated Declaration File:**

```ts
// dist/index.d.cts
declare function hello(): void;
export = hello;
```

# Cleaning

By default, `tsdown` will **clean the output directory** (`outDir`) before each build. This ensures that any files from previous builds are removed, preventing outdated or unused files from remaining in your output.

If you want to disable this behavior and keep existing files in the output directory, you can use the `--no-clean` option:

```bash
tsdown --no-clean
```

> [!NOTE]
> By default, all files in the output directory will be removed before the build process begins. Make sure this behavior aligns with your project requirements to avoid accidentally deleting important files.

# Command Line Interface

All CLI flags can also be set in the configuration file for better reusability and maintainability in complex projects. Refer to the [Config File](../options/config-file.md) documentation for more details.

## `[...files]`

Specify entry files as command arguments. This is equivalent to setting the `entry` option in the configuration file. For example:

```bash
tsdown src/index.ts src/util.ts
```

This will bundle `src/index.ts` and `src/util.ts` as separate entry points. See the [Entry](../options/entry.md) documentation for more details.

## `-c, --config <filename>`

Specify a custom configuration file. Use this option to define the path to the configuration file you want to use.

See also [Config File](../options/config-file.md).

## `--config-loader <loader>`

Specifies which config loader to use.

See also [Config File](../options/config-file.md).

## `--no-config`

Disable loading a configuration file. This is useful if you want to rely solely on command-line options or default settings.

See also [Disabling the Config File](../options/config-file.md#disable-config-file).

## `--tsconfig <tsconfig>`

Specify the path or filename of your `tsconfig` file. `tsdown` will search upwards from the current directory to find the specified file. By default, it uses `tsconfig.json`.

```bash
tsdown --tsconfig tsconfig.build.json
```

## `--format <format>`

Define the bundle format. Supported formats include:

- `esm` (ECMAScript Modules)
- `cjs` (CommonJS)
- `iife` (Immediately Invoked Function Expression)
- `umd` (Universal Module Definition)

See also [Output Format](../options/output-format.md).

## `--clean`

Clean the output directory before building. This removes all files in the output directory to ensure a fresh build.

See also [Cleaning](../options/cleaning.md).

## `--external <module>`

Mark a module as external. This prevents the specified module from being included in the bundle.

See also [Dependencies](../options/dependencies.md).

## `--minify`

Enable minification of the output bundle to reduce file size. Minification removes unnecessary characters and optimizes the code for production.

See also [Minification](../options/minification.md).

## `--target <target>`

Specify the JavaScript target version for the bundle. Examples include:

- `es2015`
- `esnext`
- `chrome100`
- `node18`

You can also disable all syntax transformations by using `--no-target` or by setting the target to `false` in your configuration file.

See also [Target](../options/target.md).

## `--log-level <level>`

Set the log level to control the verbosity of logs during the build process.

See also [Log Level](../options/log-level.md).

### ~~`--silent`~~

**Deprecated:** Please use `--log-level error` instead for better compatibility.

Suppress non-error logs during the build process. Only error messages will be displayed, making it easier to focus on critical issues.

## `-d, --out-dir <dir>`

Specify the output directory for the bundled files. Use this option to customize where the output files are written.

See also [Output Directory](../options/output-directory.md).

## `--treeshake`, `--no-treeshake`

Enable or disable tree shaking. Tree shaking removes unused code from the final bundle, reducing its size and improving performance.

See also [Tree Shaking](../options/tree-shaking.md).

## `--sourcemap`

Generate source maps for the bundled files. Source maps help with debugging by mapping the output code back to the original source files.

See also [Source Maps](../options/sourcemap.md).

## `--shims`

Enable CommonJS (CJS) and ECMAScript Module (ESM) shims. This ensures compatibility between different module systems.

See also [Shims](../options/shims.md).

## `--platform <platform>`

Specify the target platform for the bundle. Supported platforms include:

- `node` (Node.js)
- `browser` (Web browsers)
- `neutral` (Platform-agnostic)

See also [Platform](../options/platform.md).

## `--dts`

Generate TypeScript declaration (`.d.ts`) files for the bundled code. This is useful for libraries that need to provide type definitions.

See also [Declaration Files](../options/dts.md).

## `--publint`

Enable `publint` to validate your package for publishing. This checks for common issues in your package configuration, ensuring it meets best practices.

## `--unused`

Enable unused dependencies checking. This helps identify dependencies in your project that are not being used, allowing you to clean up your `package.json`.

## `-w, --watch [path]`

Enable watch mode to automatically rebuild your project when files change. Optionally, specify a path to watch for changes.

See also [Watch Mode](../options/watch-mode.md).

## `--ignore-watch <path>`

Ignore custom paths in watch mode.

## `--from-vite [vitest]`

Reuse configuration from Vite or Vitest. This allows you to extend or integrate with existing Vite or Vitest configurations seamlessly.

See also [Extending Vite or Vitest Config](../options/config-file.md#extending-vite-or-vitest-config-experimental).

## `--report`, `--no-report`

Enable or disable the generation of a build report. By default, the report is enabled and outputs the list of build artifacts along with their sizes to the console. This provides a quick overview of the build results, helping you analyze the output and identify potential optimizations. Disabling the report can be useful in scenarios where minimal console output is desired.

## `--env.* <value>`

Define compile-time environment variables, for example:

```bash
tsdown --env.NODE_ENV=production
```

Note that environment variables defined with `--env.VAR_NAME` can only be accessed as `import.meta.env.VAR_NAME` or `process.env.VAR_NAME`.

## `--debug-logs [feat]`

Show debug logs.

## `--on-success <command>`

Specify a command to run after a successful build. This is especially useful in watch mode to trigger additional scripts or actions automatically after each build completes.

```bash
tsdown --on-success "echo Build finished!"
```

## `--copy <dir>`

Copies all files from the specified directory to the output directory. This is useful for including static assets such as images, stylesheets, or other resources in your build output.

```bash
tsdown --copy public
```

All contents of the `public` directory will be copied to your output directory (e.g., `dist`).

## `--public-dir <dir>`

An alias for `--copy`.
**Deprecated:** Please use `--copy` instead for better clarity and consistency.

## `--exports`

generate the `exports`, `main`, `module`, and `types` fields in your `package.json`.

See also [Package Exports](../options/package-exports.md).

# Config File

By default, `tsdown` will search for a configuration file by looking in the current working directory and traversing upward through parent directories until it finds one. It supports the following file names:

- `tsdown.config.ts`
- `tsdown.config.mts`
- `tsdown.config.cts`
- `tsdown.config.js`
- `tsdown.config.mjs`
- `tsdown.config.cjs`
- `tsdown.config.json`
- `tsdown.config`

Additionally, you can define your configuration directly in the `tsdown` field of your `package.json` file.

## Writing a Config File

The configuration file allows you to define and customize your build settings in a centralized and reusable way. Below is a simple example of a `tsdown` configuration file:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
});
```

### Building Multiple Outputs

`tsdown` also supports returning an **array of configurations** from the config file. This allows you to build multiple outputs with different settings in a single run. For example:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: 'src/entry1.ts',
    platform: 'node',
  },
  {
    entry: 'src/entry2.ts',
    platform: 'browser',
  },
]);
```

## Specifying a Custom Config File

If your configuration file is located elsewhere or has a different name, you can specify its path using the `--config` (or `-c`) option:

```bash
tsdown --config ./path/to/config
```

## Disabling the Config File {#disable-config-file}

To disable loading a configuration file entirely, use the `--no-config` option:

```bash
tsdown --no-config
```

This is useful if you want to rely solely on command-line options or default settings.

## Config Loaders

`tsdown` supports multiple config loaders to accommodate various file formats. You can select a config loader using the `--config-loader` option. The available loaders are:

- `auto` (default): Utilizes native runtime loading for TypeScript if supported; otherwise, defaults to `unrun`.
- `native`: Loads TypeScript configuration files using native runtime support. Requires a compatible environment, such as the latest Node.js, Deno, or Bun.
- `unrun`: Loads configuration files using the [`unrun`](https://gugustinette.github.io/unrun/) library. It provides more powerful and flexible loading capabilities.

> [!TIP]
> Node.js does not natively support importing TypeScript files without specifying the file extension. If you are using Node.js and want to load a TypeScript config file without including the `.ts` extension, consider using the `unrun` loader for seamless compatibility.

## Extending Vite or Vitest Config (Experimental)

`tsdown` provides an **experimental** feature to extend your existing Vite or Vitest configuration files. This allows you to reuse specific configuration options, such as `resolve` and `plugins`, while ignoring others that are not relevant to `tsdown`.

To enable this feature, use the `--from-vite` option:

```bash
tsdown --from-vite        # Load vite.config.*
tsdown --from-vite vitest # Load vitest.config.*
```

> [!WARNING]
> This feature is **experimental** and may not support all Vite or Vitest configuration options. Only specific options, such as `resolve` and `plugins`, are reused. Use with caution and test thoroughly in your project.

> [!TIP]
> Extending Vite or Vitest configurations can save time and effort if your project already uses these tools, allowing you to build upon your existing setup without duplicating configuration.

## Reference

For a full list of available configuration options, refer to the [Config Options Reference](../reference/api/Interface.UserConfig.md). This includes detailed explanations of all supported fields and their usage.

# Dependencies

When bundling with `tsdown`, dependencies are handled intelligently to ensure your library remains lightweight and easy to consume. Here’s how `tsdown` processes different types of dependencies and how you can customize this behavior.

## Default Behavior

### `dependencies` and `peerDependencies`

By default, `tsdown` **does not bundle dependencies** listed in your `package.json` under `dependencies` and `peerDependencies`:

- **`dependencies`**: These are treated as external and will not be included in the bundle. Instead, they will be installed automatically by npm (or other package managers) when your library is installed.
- **`peerDependencies`**: These are also treated as external. Users of your library are expected to install these dependencies manually, although some package managers may handle this automatically.

### `devDependencies` and Phantom Dependencies

- **`devDependencies`**: Dependencies listed under `devDependencies` in your `package.json` will **only be bundled if they are actually imported or required by your source code**.
- **Phantom Dependencies**: Dependencies that exist in your `node_modules` folder but are not explicitly listed in your `package.json` will **only be bundled if they are actually used in your code**.

In other words, only the `devDependencies` and phantom dependencies that are actually referenced in your project will be included in the bundle.

## Skipping Node Modules Bundling

If you want to **skip resolving and bundling all dependencies from `node_modules`**, you can enable the `skipNodeModulesBundle` option in your configuration:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  skipNodeModulesBundle: true,
});
```

This will prevent `tsdown` from parsing and bundling any dependencies from `node_modules`, regardless of how they are referenced in your code.

## Customizing Dependency Handling

`tsdown` provides two options to override the default behavior:

### `external`

The `external` option allows you to explicitly mark certain dependencies as external, ensuring they are not bundled into your library. For example:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  external: ['lodash', /^@my-scope\//],
});
```

In this example, `lodash` and all packages under the `@my-scope` namespace will be treated as external.

### `noExternal`

The `noExternal` option allows you to force certain dependencies to be bundled, even if they are listed in `dependencies` or `peerDependencies`. For example:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  noExternal: ['some-package'],
});
```

Here, `some-package` will be bundled into your library.

## Handling Dependencies in Declaration Files

For declaration files, `tsdown` **does not bundle any dependencies by default**. This ensures that your `.d.ts` files remain clean and focused on your library's types.

### Customizing Type Resolution

You can use the `dts.resolve` option to explicitly include type definitions for certain dependencies:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: {
    resolve: ['lodash', /^@types\//],
  },
});
```

In this example, type definitions for `lodash` and all packages under the `@types` namespace will be bundled into the `.d.ts` files.

### Resolver Option

When bundling complex third-party types, you may encounter cases where the default resolver (Oxc) cannot handle certain scenarios. For example, the types for `@babel/generator` are located in the `@types/babel__generator` package, which may not be resolved correctly by Oxc.

To address this, you can set the `resolver` option to `tsc` in your configuration. This uses the native TypeScript resolver, which is slower but much more compatible with complex type setups:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: {
    resolve: ['@babel/generator'],
    resolver: 'tsc',
  },
});
```

If you want to bundle **all** types, you can set `resolve: true`. However, it is strongly recommended to also set `resolver: 'tsc'` to minimize unexpected issues:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: {
    resolve: true,
    resolver: 'tsc',
  },
});
```

## Summary

- **Default Behavior**:
  - `dependencies` and `peerDependencies` are treated as external and not bundled.
  - `devDependencies` and phantom dependencies are only bundled if they are actually used in your code.
- **Customization**:
  - Use `external` to mark specific dependencies as external.
  - Use `noExternal` to force specific dependencies to be bundled.
  - Use `skipNodeModulesBundle` to skip resolving and bundling all dependencies from `node_modules`.
- **Declaration Files**:
  - Dependencies are not bundled by default.
  - Use `dts.resolve` to include specific dependency types in `.d.ts` files.
  - Use `resolver: 'tsc'` for better compatibility with complex third-party types.

By understanding and customizing dependency handling, you can ensure your library is optimized for both size and usability.

# Declaration Files (dts)

Declaration files (`.d.ts`) are an essential part of TypeScript libraries, providing type definitions that allow consumers of your library to benefit from TypeScript's type checking and IntelliSense.

`tsdown` makes it easy to generate and bundle declaration files for your library, ensuring a seamless developer experience for your users.

> [!NOTE]
> You must install `typescript` in your project for declaration file generation to work properly.

## How dts Works in tsdown

`tsdown` uses [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts) internally to generate and bundle `.d.ts` files. This plugin is specifically designed to handle declaration file generation efficiently and integrates seamlessly with `tsdown`.

If you encounter any issues related to `.d.ts` generation, please report them directly to the [rolldown-plugin-dts repository](https://github.com/sxzz/rolldown-plugin-dts/issues).

## Enabling dts Generation

If your `package.json` contains a `types` or `typings` field, declaration file generation will be **enabled by default** in `tsdown`.

You can also explicitly enable `.d.ts` generation using the `--dts` option in the CLI or by setting `dts: true` in your configuration file.

### CLI

```bash
tsdown --dts
```

### Config File

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
});
```

## Declaration Map

Declaration maps allow `.d.ts` files to be mapped back to their original `.ts` sources, which is especially useful in monorepo setups for improved navigation and debugging. Learn more in the [TypeScript documentation](https://www.typescriptlang.org/tsconfig/#declarationMap).

You can enable declaration maps in either of the following ways (no need to set both):

### Enable in `tsconfig.json`

Enable the `declarationMap` option under `compilerOptions`:

```json [tsconfig.json]
{
  "compilerOptions": {
    "declarationMap": true
  }
}
```

### Enable in tsdown Config

Set the `dts.sourcemap` option to `true` in your tsdown config file:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: {
    sourcemap: true,
  },
});
```

## Performance Considerations

The performance of `.d.ts` generation depends on your `tsconfig.json` configuration:

### With `isolatedDeclarations`

If your `tsconfig.json` has the `isolatedDeclarations` option enabled, `tsdown` will use **oxc-transform** for `.d.ts` generation. This method is **extremely fast** and highly recommended for optimal performance.

```json [tsconfig.json]
{
  "compilerOptions": {
    "isolatedDeclarations": true
  }
}
```

### Without `isolatedDeclarations`

If `isolatedDeclarations` is not enabled, `tsdown` will fall back to using the TypeScript compiler for `.d.ts` generation. While this approach is reliable, it is relatively slower compared to `oxc-transform`.

> [!TIP]
> If speed is critical for your workflow, consider enabling `isolatedDeclarations` in your `tsconfig.json`.

## Build Process for dts

- **For ESM Output**: Both `.js` and `.d.ts` files are generated in the **same build process**. If you encounter compatibility issues, please report them.
- **For CJS Output**: A **separate build process** is used exclusively for `.d.ts` generation to ensure compatibility.

## Advanced Options

`rolldown-plugin-dts` provides several advanced options to customize `.d.ts` generation. For a detailed explanation of these options, refer to the [plugin's documentation](https://github.com/sxzz/rolldown-plugin-dts#options).

# Entry

The `entry` option specifies the entry files for your project. These files serve as the starting points for the bundling process. You can define entry files either via the CLI or in the configuration file.

## Using the CLI

You can specify entry files directly as command arguments when using the CLI. For example:

```bash
tsdown src/entry1.ts src/entry2.ts
```

This command will bundle `src/entry1.ts` and `src/entry2.ts` as separate entry points.

## Using the Config File

In the configuration file, the `entry` option allows you to define entry files in various formats:

### Single Entry File

Specify a single entry file as a string:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
});
```

### Multiple Entry Files

Define multiple entry files as an array of strings:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/entry1.ts', 'src/entry2.ts'],
});
```

### Entry Files with Aliases

Use an object to define entry files with aliases. The keys represent alias names, and the values represent file paths:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    main: 'src/index.ts',
    utils: 'src/utils.ts',
  },
});
```

This configuration will create two bundles: one for `src/index.ts` (output as `dist/main.js`) and one for `src/utils.ts` (output as `dist/utils.js`).

## Using Glob Patterns

The `entry` option supports [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns), enabling you to match multiple files dynamically. For example:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/**/*.ts',
});
```

This configuration will include all `.ts` files in the `src` directory and its subdirectories as entry points.

> [!TIP]
>
> On **Windows**, you must use forward slashes (`/`) instead of backslashes (`\`) in file paths when using glob patterns.

# Frequently Asked Questions

@--
TODO

## What is the difference between tsdown and Rolldown?

## Why should I use tsdown instead of other bundlers (like tsup, unbuild, ...)? --

## Will tsdown support stub mode (similar to unbuild)? {#stub-mode}

Currently, `tsdown` does **not** support stub mode, and there are no immediate plans to add it. In today's ecosystem, we believe that a simple stub mode offers limited practical value for most library development workflows. Instead, we recommend using [watch mode](../options/watch-mode.md) for a fast and efficient development experience. For a more detailed explanation of this decision, please see [this GitHub comment](https://github.com/rolldown/tsdown/pull/164#issuecomment-2849720617).

While stub mode is not supported at this time, we may revisit this decision in the future if the ecosystem evolves and the need becomes more compelling.

# Getting Started

:::warning 🚧 Beta Software
[Rolldown](https://rolldown.rs) is currently in beta status. While it can already handle most production use cases, there may still be bugs and rough edges.
:::

## Installation

There are several ways to get started with `tsdown`. You can:

- [Manually install](#manual-installation) it as a development dependency in your project.
- Use the [starter templates](#starter-templates) to quickly scaffold a new project.
- Try it online using [StackBlitz](#try-online).

### Manual Installation {#manual-installation}

Install `tsdown` as a development dependency using your preferred package manager:

::: code-group

```sh [npm]
npm install -D tsdown
```

```sh [pnpm]
pnpm add -D tsdown
```

```sh [yarn]
yarn add -D tsdown
```

```sh [bun]
bun add -D tsdown
```

:::

Optionally, if you're not using [`isolatedDeclarations`](https://www.typescriptlang.org/tsconfig/#isolatedDeclarations), you should also install TypeScript as a development dependency:

::: code-group

```sh [npm]
npm install -D typescript
```

```sh [pnpm]
pnpm add -D typescript
```

```sh [yarn]
yarn add -D typescript
```

```sh [bun]
bun add -D typescript
```

:::

:::tip Compatibility Note
`tsdown` requires Node.js version 20.19 or higher. Please ensure your development environment meets this requirement before installing. While `tsdown` is primarily tested with Node.js, support for Deno and Bun is experimental and may not work as expected.
:::

### Starter Templates {#starter-templates}

To get started even faster, you can use the [create-tsdown](https://github.com/rolldown/tsdown/tree/main/packages/create-tsdown) CLI, which provides a set of starter templates for building pure TypeScript libraries, as well as frontend libraries like React and Vue.

::: code-group

```sh [npm]
npm create tsdown@latest
```

```sh [pnpm]
pnpm create tsdown@latest
```

```sh [yarn]
yarn create tsdown@latest
```

```sh [bun]
bun create tsdown@latest
```

:::

These templates includes ready-to-use configurations and best practices for building, testing and linting TypeScript projects.

### Try Online {#try-online}

You can try tsdown directly in your browser using StackBlitz:

[![tsdown-starter-stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rolldown/tsdown-starter-stackblitz)

This template is preconfigured for tsdown, so you can experiment and get started quickly—no local setup required.

## Using the CLI

To verify that `tsdown` is installed correctly, run the following command in your project directory:

```sh
./node_modules/.bin/tsdown --version
```

You can also explore the available CLI options and examples with:

```sh
./node_modules/.bin/tsdown --help
```

### Your First Bundle

Let's create two source TypeScript files:

```ts [src/index.ts]
import { hello } from './hello.ts';

hello();
```

```ts [src/hello.ts]
export function hello() {
  console.log('Hello tsdown!');
}
```

Next, initialize the `tsdown` configuration file:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
});
```

Now, run the following command to bundle your code:

```sh
./node_modules/.bin/tsdown
```

You should see the bundled output written to `dist/index.mjs`. To verify it works, run the output file:

```sh
node dist/index.mjs
```

You should see the message `Hello tsdown!` printed to the console.

### Using the CLI in npm Scripts

To simplify the command, you can add it to your `package.json` scripts:

```json{5} [package.json]
{
  "name": "my-tsdown-project",
  "type": "module",
  "scripts": {
    "build": "tsdown"
  },
  "devDependencies": {
    "tsdown": "^0.9.0"
  }
}
```

Now, you can build your project with:

```sh
npm run build
```

## Using the Config File

While you can use the CLI directly, it's recommended to use a configuration file for more complex projects. This allows you to define and manage your build settings in a centralized and reusable way.

For more details, refer to the [Config File](../options/config-file.md) documentation.

## Using Plugins

`tsdown` supports plugins to extend its functionality. You can use Rolldown plugins, Unplugin plugins, and most Rollup plugins seamlessly. To use plugins, add them to the `plugins` array in your configuration file. For example:

```ts [tsdown.config.ts]
import SomePlugin from 'some-plugin';
import { defineConfig } from 'tsdown';

export default defineConfig({
  plugins: [SomePlugin()],
});
```

For more details, refer to the [Plugins](../advanced/plugins.md) documentation.

## Using Watch Mode

You can enable watch mode to automatically rebuild your project whenever files change. This is particularly useful during development to streamline your workflow. Use the `--watch` (or `-w`) option:

```bash
tsdown --watch
```

For more details, refer to the [Watch Mode](../options/watch-mode.md) documentation.

# Hooks

Inspired by [unbuild](https://github.com/unjs/unbuild), `tsdown` supports a flexible hooks system that allows you to extend and customize the build process. While we recommend using the [plugin system](./plugins.md) for most build-related extensions, hooks provide a convenient way to inject Rolldown plugins or perform additional tasks at specific stages of the build lifecycle.

## Usage

You can define hooks in your configuration file in two ways:

### Passing an Object

Define your hooks as an object, where each key is a hook name and the value is a function:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  hooks: {
    'build:done': async () => {
      await doSomething();
    },
  },
});
```

### Passing a Function

Alternatively, you can pass a function that receives the hooks object, allowing you to register hooks programmatically:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  hooks(hooks) {
    hooks.hook('build:prepare', () => {
      console.log('Hello World');
    });
  },
});
```

For more details on how to use the hooks, refer to the [hookable](https://github.com/unjs/hookable) documentation.

## Available Hooks

For detailed type definitions, see [`src/features/hooks.ts`](https://github.com/rolldown/tsdown/blob/main/src/features/hooks.ts).

### `build:prepare`

Invoked before each tsdown build starts. Use this hook to perform setup or preparation tasks.

### `build:before`

Invoked before each Rolldown build. For dual-format builds, this hook is called for each format. Useful for configuring or modifying the build context before bundling.

### `build:done`

## Invoked after each tsdown build completes. Use this hook for cleanup or post-processing tasks

# <https://vitepress.dev/reference/default-theme-home-page>

layout: home

hero:
name: 'tsdown'
text: 'The Elegant<br>Library Bundler'
tagline: Powered by Rolldown
image:
src: /tsdown.svg
alt: tsdown
actions: - text: What is tsdown?
openVideoModal: true - theme: brand
text: Get Started
link: /guide/ - theme: alt
text: API Reference
link: /reference/api/Interface.UserConfig.md

features:

- icon: 🚀
  title: Blazing fast
  details: |
  Build and generate declaration files powered by Oxc and Rolldown, incredibly fast!

- icon: ♻️
  title: Powerful ecosystem
  details: Support Rollup, Rolldown, unplugin plugins, and some Vite plugins.

- icon: ️🛠️
  title: Easy to use
  details: |
  tsdown preconfigures everything you need to get started, so you can focus on writing code.

- icon: 🔄
  title: Seamless migration
  details: |
  Compatible with tsup's main options and features, ensuring a smooth transition.

---

# Introduction

**tsdown** is _The Elegant Library Bundler_. Designed with simplicity and speed in mind, it provides a seamless and efficient way to bundle your TypeScript and JavaScript libraries. Whether you're building a small utility or a complex library, `tsdown` empowers you to focus on your code while it handles the bundling process with elegance.

## Why tsdown?

`tsdown` is built on top of [Rolldown](https://rolldown.rs), a cutting-edge bundler written in Rust. While Rolldown is a powerful and general-purpose tool, `tsdown` takes it a step further by providing a **complete out-of-the-box solution** for library authors.

### Key Differences Between tsdown and Rolldown

- **Simplified Configuration**: `tsdown` minimizes the need for complex configurations by offering sensible defaults tailored for library development. It provides a streamlined experience, so you can focus on your code rather than the bundling process.
- **Library-Specific Features**: Unlike Rolldown, which is designed as a general-purpose bundler, `tsdown` is optimized specifically for building libraries. It includes features like automatic TypeScript declaration generation and multiple output formats.
- **Future-Ready**: As an **official project of Rolldown**, `tsdown` is deeply integrated into its ecosystem and will continue to evolve alongside it. By leveraging Rolldown's latest advancements, `tsdown` aims to explore new possibilities for library development. Furthermore, `tsdown` is positioned to become the **foundation for [Rolldown Vite](https://github.com/vitejs/rolldown-vite)'s Library Mode**, ensuring a cohesive and robust experience for library authors in the long term.

## Plugin Ecosystem

`tsdown` supports the entire Rolldown plugin ecosystem, making it easy to extend and customize your build process. Additionally, it is compatible with most Rollup plugins, giving you access to a vast library of existing tools.

For more details, refer to the [Plugins](../advanced/plugins.md) documentation.

## What Can It Bundle?

`tsdown` is designed to handle all the essentials for modern library development:

- **TypeScript and JavaScript**: Seamlessly bundle `.ts` and `.js` files with support for modern syntax and features.
- **TypeScript Declarations**: Automatically generate declaration files (`.d.ts`) for your library.
- **Multiple Output Formats**: Generate `esm`, `cjs`, `iife`, and `umd` bundles to ensure compatibility across different environments.
- **Assets**: Include and process non-code assets like `.json` or `.wasm` files.

With its built-in support for [tree shaking](../options/tree-shaking.md), [minification](../options/minification.md), and [source maps](../options/sourcemap.md), `tsdown` ensures your library is optimized for production.

## Fast and Elegant

`tsdown` is built to be **fast**. Leveraging Rolldown's Rust-based performance, it delivers blazing-fast builds even for large projects. At the same time, it is **elegant**—offering a clean and intuitive configuration system that minimizes boilerplate and maximizes productivity.

## Getting Started

Ready to dive in? Check out the [Getting Started](./getting-started.md) guide to set up your first project with `tsdown`.

Want to use tsdown from your own scripts? See [Programmatic Usage](../advanced/programmatic-usage.md).

## Credits

`tsdown` is made possible by the open-source community and the many innovative tools in the JavaScript and TypeScript ecosystem. We extend our gratitude to all contributors and maintainers whose work has laid the foundation for this project.

### Prior Arts

- **Rollup**: Provided the original inspiration for modern JavaScript bundling and a robust plugin system.
- **esbuild**: Demonstrated the power of fast, native bundling and influenced the pursuit of performance in build tools.
- **tsup**: Inspired the out-of-the-box developer experience and many CLI options, as well as some implementation details.
- **unbuild**: Inspired the flexible hooks system now available in tsdown.
- **Rolldown**: Serves as the high-performance, Rust-based core engine that powers tsdown and enables many of its advanced features.

# Log Level

Controlling the verbosity of logs during the bundling process helps you focus on what matters most. The recommended way to manage log output in `tsdown` is by using the `--log-level` option.

## Usage

To suppress all logs—including errors—set the log level to `silent`:

```bash
tsdown --log-level silent
```

To display only error messages, set the log level to `error`:

```bash
tsdown --log-level error
```

This is useful for CI/CD pipelines or scenarios where you want minimal or no console output.

> [!NOTE] Deprecated Silent Mode
> The `--silent` option is **deprecated**. Please use `--log-level error` instead for future compatibility.

## Available Log Levels

- `silent`: No logs are shown, including errors.
- `error`: Only error messages are shown.
- `warn`: Warnings and errors are logged.
- `info`: Informational messages, warnings, and errors are logged (default).

Choose the log level that best fits your workflow to control the amount of information displayed during the build process.

# Migrate from tsup

[tsup](https://tsup.egoist.dev/) is a powerful and widely-used bundler that shares many similarities with `tsdown`. While `tsup` is built on top of [esbuild](https://esbuild.github.io/), `tsdown` leverages the power of [Rolldown](https://rolldown.rs/) to deliver a **faster** and more **powerful** bundling experience.

## Migration Guide

If you're currently using `tsup` and want to migrate to `tsdown`, the process is straightforward thanks to the dedicated `migrate` command:

```bash
npx tsdown migrate
```

> [!WARNING]
> Please save your changes before migration. The migration process may modify your configuration files, so it's important to ensure all your changes are committed or backed up beforehand.

### Migration Options

The `migrate` command supports the following options to customize the migration process:

- `--cwd <dir>` (or `-c`): Specify the working directory for the migration.
- `--dry-run` (or `-d`): Perform a dry run to preview the migration without making any changes.

With these options, you can easily tailor the migration process to fit your specific project setup.

## Differences from tsup

While `tsdown` aims to be highly compatible with `tsup`, there are some differences to be aware of:

### Default Values

- **`format`**: Defaults to `esm`.
- **`clean`**: Enabled by default and will clean the `outDir` before each build.
- **`dts`**: Automatically enabled if your `package.json` contains a `typings` or `types` field.
- **`target`**: By default, reads from the `engines.node` field in your `package.json` if available.

### Feature Gaps

Some features available in `tsup` are not yet implemented in `tsdown`. If you find an option missing that you need, please [open an issue](https://github.com/rolldown/tsdown/issues) to let us know your requirements.

### New Features in tsdown

`tsdown` also introduces new features not available in `tsup`:

- **`nodeProtocol`**: Control how Node.js built-in module imports are handled:
  - `true`: Add `node:` prefix to built-in modules (e.g., `fs` → `node:fs`)
  - `'strip'`: Remove `node:` prefix from imports (e.g., `node:fs` → `fs`)
  - `false`: Keep imports as-is (default)

Please review your configuration after migration to ensure it matches your expectations.

## Acknowledgements

`tsdown` would not have been possible without the inspiration and contributions of the open-source community. We would like to express our heartfelt gratitude to the following:

- **[tsup](https://tsup.egoist.dev/)**: `tsdown` was heavily inspired by `tsup`, and even incorporates parts of its codebase. The simplicity and efficiency of `tsup` served as a guiding light during the development of `tsdown`.
- **[@egoist](https://github.com/egoist)**: The creator of `tsup`, whose work has significantly influenced the JavaScript and TypeScript tooling ecosystem. Thank you for your dedication and contributions to the community.

# Minification

Minification is the process of compressing your code to reduce its size and improve performance by removing unnecessary characters, such as whitespace, comments, and unused code.

You can enable minification in `tsdown` using the `--minify` option:

```bash
tsdown --minify
```

> [!NOTE]
> The minification feature is based on [Oxc](https://oxc.rs/docs/contribute/minifier), which is currently in alpha and can still have bugs. We recommend thoroughly testing your output in production environments.

### Example

Given the following input code:

```ts [src/index.ts]
const x = 1;

function hello(x: number) {
  console.log('Hello World');
  console.log(x);
}

hello(x);
```

Here are the two possible outputs, depending on whether minification is enabled:

::: code-group

```js [dist/index.mjs (without --minify)]
//#region src/index.ts
const x = 1;
function hello(x$1) {
  console.log('Hello World');
  console.log(x$1);
}
hello(x);

//#endregion
```

@-- prettier-ignore --

```js [dist/index.mjs (with --minify)]
const e = 1;
function t(e) {
  console.log(`Hello World`), console.log(e);
}
t(e);
```

:::

# Output Directory

By default, `tsdown` bundles your code into the `dist` directory located in the current working folder.

If you want to customize the output directory, you can use the `--out-dir` (or `-d`) option:

```bash
tsdown -d ./custom-output
```

### Example

```bash
# Default behavior: outputs to ./dist
tsdown

# Custom output directory: outputs to ./build
tsdown -d ./build
```

> [!NOTE]
> The specified output directory will be created if it does not already exist. Ensure the directory path aligns with your project structure to avoid overwriting unintended files.

# Output Format

By default, `tsdown` generates JavaScript code in the [ESM](https://nodejs.org/api/esm.html) (ECMAScript Module) format. However, you can specify the desired output format using the `--format` option:

```bash
tsdown --format esm # default
```

### Available Formats

- [`esm`](https://nodejs.org/api/esm.html): ECMAScript Module format, ideal for modern JavaScript environments, including browsers and Node.js.
- [`cjs`](https://nodejs.org/api/modules.html): CommonJS format, commonly used in Node.js projects.
- [`iife`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE): Immediately Invoked Function Expression, suitable for embedding in `<script>` tags or standalone browser usage.
- [`umd`](https://github.com/umdjs/umd): Universal Module Definition, a format that works on AMD, CommonJS, and global variables.

### Example

```bash
# Generate ESM output (default)
tsdown --format esm

# Generate both ESM and CJS outputs
tsdown --format esm --format cjs

# Generate IIFE output for browser usage
tsdown --format iife
```

> [!TIP]
> You can specify multiple formats in a single command to generate outputs for different environments. For example, combining `esm` and `cjs` ensures compatibility with both modern and legacy systems.

# Auto-Generating Package Exports

`tsdown` provides an experimental feature to automatically infer and generate the `exports`, `main`, `module`, and `types` fields in your `package.json`. This helps ensure your package exports are always up-to-date and correctly reflect your build outputs.

## Enabling Auto Exports

You can enable this feature by setting the `exports: true` option in your `tsdown` configuration file:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  exports: true,
});
```

This will automatically analyze your entry points and output files, and update your `package.json` accordingly.

> [!WARNING]
> This is an **experimental feature**. Please review the generated fields before publishing your package.

## Exporting All Files

By default, only entry files are exported. If you want to export all files (including those not listed as entry points), you can enable the `exports.all` option:

```ts
export default defineConfig({
  exports: {
    all: true,
  },
});
```

This will include all relevant files in the generated `exports` field.

## Dev-Time Source Linking

### Dev Exports

During development, you may want your `exports` to point directly to your source files for better debugging and editor support. You can enable this by setting `exports.devExports` to `true`:

```ts
export default defineConfig({
  exports: {
    devExports: true,
  },
});
```

With this setting, the generated `exports` in your `package.json` will link to your source code. The exports for the built output will be written to `publishConfig`, which will override the top-level `exports` field when using `yarn` or `pnpm`'s `pack`/`publish` commands (note: this is **not supported by npm**).

### Conditional Dev Exports

You can also set `exports.devExports` to a string to only link to source code under a specific [condition](https://nodejs.org/api/packages.html#conditional-exports):

```ts
export default defineConfig({
  exports: {
    devExports: 'development',
  },
});
```

This is especially useful when combined with TypeScript's [`customConditions`](https://www.typescriptlang.org/tsconfig/#customConditions) option, allowing you to control which conditions use the source code.

## Customizing Exports

If you need more control over the generated exports, you can provide a custom function via `exports.customExports`:

```ts
export default defineConfig({
  exports: {
    customExports(pkg, context) {
      pkg['./foo'] = './foo.js';
      return pkg;
    },
  },
});
```

# Platform

The platform specifies the target runtime environment for the bundled JavaScript code.

By default, `tsdown` bundles for the `node` runtime, but you can customize it using the `--platform` option:

```bash
tsdown --platform node    # default
tsdown --platform browser
tsdown --platform neutral
```

### Available Platforms

- **`node`:** Targets the [Node.js](https://nodejs.org/) runtime and compatible environments such as Deno and Bun. This is the default platform, and Node.js built-in modules (e.g., `fs`, `path`) will be resolved automatically. Ideal for toolchains or server-side projects.
- **`browser`:** Targets web browsers (e.g., Chrome, Firefox). This is suitable for front-end projects. If your code uses Node.js built-in modules, a warning will be displayed, and you may need to use polyfills or shims to ensure compatibility.
- **`neutral`:** A platform-agnostic target with no specific runtime assumptions. Use this if your code is intended to run in multiple environments or you want full control over runtime behavior. This is particularly useful for libraries or shared code that may be used in both Node.js and browser environments.

> [!NOTE]
> For the CJS format, the platform is always set to `'node'` and cannot be changed. [Why?](https://github.com/rolldown/rolldown/pull/4693#issuecomment-2912229545)

### Example

```bash
# Bundle for Node.js (default)
tsdown --platform node

# Bundle for browsers
tsdown --platform browser

# Bundle for a neutral platform
tsdown --platform neutral
```

> [!TIP]
> Choosing the right platform ensures your code is optimized for its intended runtime. For example, use `browser` for front-end projects, `node` for server-side applications, and `neutral` for universal libraries.

# Plugins

`tsdown` uses [Rolldown](https://rolldown.rs) as its core engine, which means it seamlessly supports Rolldown plugins. Plugins are a powerful way to extend and customize the bundling process, enabling features like code transformation, asset handling, and more.

## Supported Plugin Ecosystems

### Rolldown Plugins

Since `tsdown` is built on Rolldown, it supports all Rolldown plugins. You can use any plugin designed for Rolldown to enhance your build process.

### Unplugin

[Unplugin](https://unplugin.unjs.io/) is a modern plugin framework that supports multiple bundlers, including Rolldown. Most Unplugin plugins (commonly named with the `unplugin-` prefix) work seamlessly with `tsdown`.

### Rollup Plugins

Rolldown is highly compatible with Rollup's plugin API, so `tsdown` can use most Rollup plugins without modification. This gives you access to a wide range of existing plugins in the Rollup ecosystem.

> [!NOTE] Type Compatibility
> Rollup plugins may sometimes cause TypeScript type errors because the Rollup and Rolldown plugin APIs are not 100% compatible. If you encounter type errors when using Rollup plugins, you can safely ignore them by using `// @ts-expect-error` or casting the plugin as `any`:
>
> ```ts
> import SomeRollupPlugin from 'some-rollup-plugin';
> export default defineConfig({
>   plugins: [SomeRollupPlugin() as any],
> });
> ```

### Vite Plugins

Vite plugins may work with `tsdown` if they do not rely on Vite-specific internal APIs or behaviors. However, plugins that depend heavily on Vite's internals may not be compatible. We plan to improve support for Vite plugins in the future.

> [!NOTE] Type Compatibility
> Similarly, Vite plugins may also cause type errors due to API differences. You can use `// @ts-expect-error` or `as any` to suppress these errors if needed.

## How to Use Plugins

To use plugins in `tsdown`, you need to add them to the `plugins` array in your configuration file. Plugins **cannot** be added via the CLI.

Here’s an example of how to use a plugin:

```ts [tsdown.config.ts]
import SomePlugin from 'some-plugin';
import { defineConfig } from 'tsdown';

export default defineConfig({
  plugins: [SomePlugin()],
});
```

For specific plugin usage, refer to the plugin's own documentation.

## Writing Your Own Plugins

If you want to create a custom plugin for `tsdown`, you can follow Rolldown's plugin development guide. Rolldown's plugin API is highly flexible and similar to Rollup's, making it easy to get started.

Refer to the [Rolldown Plugin Development Guide](https://rolldown.rs/guide/plugin-development) for detailed instructions on writing your own plugins.

> [!TIP]
> Plugins are a great way to extend `tsdown`'s functionality. Whether you're using existing plugins or creating your own, they allow you to tailor the bundling process to your project's specific needs.

# Programmatic Usage

You can use `tsdown` directly from your JavaScript or TypeScript code. This is useful for custom build scripts, integrations, or advanced automation.

## Example

```ts twoslash
import { build } from 'tsdown';

await build({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  // ...any other options
});
```

All CLI options are available as properties in the options object. See [Config Options](../reference/api/Interface.UserConfig.md) for the full list.

# React Support

`tsdown` provides first-class support for building React component libraries. As [Rolldown](https://rolldown.rs/) natively supports bundling JSX/TSX files, you don't need any additional plugins to get started.

## Quick Start

For the fastest way to get started, use the React component starter template. This starter project comes pre-configured for React library development, so you can focus on building components right away.

```bash
npx create-tsdown@latest -t react
```

## Minimal Example

To configure `tsdown` for a React library, you can just use a standard `tsdown.config.ts`:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
});
```

Create your typical React component:

```tsx [MyButton.tsx]
import React from 'react';

interface MyButtonProps {
  type?: 'primary';
}

export const MyButton: React.FC<MyButtonProps> = ({ type }) => {
  return <button className="my-button">my button: type {type}</button>;
};
```

And export it in your entry file:

```ts [index.ts]
export { MyButton } from './MyButton';
```

::: warning

There are 2 ways of transforming JSX/TSX files in `tsdown`:

- **classic**
- **automatic** (default)

If you need to use classic JSX transformation, you can configure Rolldown's [`inputOptions.jsx`](https://rolldown.rs/reference/config-options#jsx) option in your configuration file:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  inputOptions: {
    jsx: 'react', // Use classic JSX transformation
  },
});
```

:::

# Customizing Rolldown Options

`tsdown` uses [Rolldown](https://rolldown.rs) as its core bundling engine. This allows you to easily pass or override options directly to Rolldown, giving you fine-grained control over the bundling process.

For a full list of available Rolldown options, refer to the [Rolldown Config Options](https://rolldown.rs/reference/config-options) documentation.

> [!WARNING]
> You should be familiar with the behavior of the Rolldown options you are overriding and ensure you have read the Rolldown documentation.

## Overriding `inputOptions`

You can override the `inputOptions` generated by `tsdown` to customize how Rolldown processes your input files. There are two ways to do this:

### Using an Object

You can directly pass an object to override specific `inputOptions`:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  inputOptions: {
    cwd: './custom-directory',
  },
});
```

In this example, the `cwd` (current working directory) option is set to `./custom-directory`.

### Using a Function

Alternatively, you can use a function to dynamically modify the `inputOptions`. The function receives the generated `inputOptions` and the current `format` as arguments:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  inputOptions(inputOptions, format) {
    inputOptions.cwd = './custom-directory';
    return inputOptions;
  },
});
```

This approach is useful when you need to customize options based on the output format or other dynamic conditions.

## Overriding `outputOptions`

The `outputOptions` can be customized in the same way as `inputOptions`. For example:

### Using an Object

You can directly pass an object to override specific `outputOptions`:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  outputOptions: {
    comments: 'preserve-legal',
  },
});
```

In this example, the `comments: 'preserve-legal'` option ensures that legal comments (e.g., license headers) are preserved in the output files.

### Using a Function

You can also use a function to dynamically modify the `outputOptions`. The function receives the generated `outputOptions` and the current `format` as arguments:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  outputOptions(outputOptions, format) {
    if (format === 'esm') {
      outputOptions.comments = 'preserve-legal';
    }
    return outputOptions;
  },
});
```

This ensures that legal comments are preserved only for the `esm` format.

## When to Use Custom Options

While `tsdown` exposes many common options directly, there may be cases where certain Rolldown options are not exposed. In such cases, you can use the `inputOptions` and `outputOptions` overrides to directly set these options in Rolldown.

> [!TIP]
> Using `inputOptions` and `outputOptions` gives you full access to Rolldown's powerful configuration system, allowing you to customize your build process beyond what `tsdown` exposes directly.

# Shims

Shims are small pieces of code that provide compatibility between different module systems, such as CommonJS (CJS) and ECMAScript Modules (ESM). In `tsdown`, shims are used to bridge the gap between these systems, ensuring your code runs smoothly across different environments.

## CommonJS Variables in ESM

In CommonJS, `__dirname` and `__filename` are built-in variables that provide the directory and file path of the current module. However, these variables are **not available in ESM** by default.

To improve compatibility, when the `shims` option is enabled, `tsdown` will automatically generate these variables for ESM output. For example:

```js
console.log(__dirname); // Available in ESM when shims are enabled
console.log(__filename); // Available in ESM when shims are enabled
```

### Runtime Overhead

The generated shims for `__dirname` and `__filename` introduce a very small runtime overhead. However, if these variables are not used in your code, they will be automatically removed during the bundling process, ensuring no unnecessary code is included.

## The `require` Function in ESM

When using the `require` function in ESM output and the `platform` is set to `node`, `tsdown` will **automatically inject a `require` shim using Node.js's `createRequire`**, regardless of the `shims` option. This ensures that you can use `require` in ESM modules in a Node.js environment without manual setup.

For example:

```js
// const require = createRequire(import.meta.url) [auto injected]

const someModule = require('some-module');
```

This behavior is always enabled for ESM output targeting Node.js, so you don't need to configure anything extra to use `require` in this scenario.

## ESM Variables in CommonJS

Even if the `shims` option is **not enabled**, `tsdown` will automatically shim the following ESM-specific variables in CommonJS output:

- `import.meta.url`
- `import.meta.dirname`
- `import.meta.filename`

These variables are provided to ensure compatibility when using ESM-like features in CommonJS environments. For example:

```js
console.log(import.meta.url);
console.log(import.meta.dirname);
console.log(import.meta.filename);
```

This behavior is always enabled for CommonJS output, so you don't need to configure anything to use these variables.

## Enabling Shims

To enable shims for `__dirname` and `__filename` in ESM output, use the `--shims` option in the CLI or set `shims: true` in the configuration file:

### CLI

```bash
tsdown --shims
```

### Config File

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';

export default defineConfig({
  shims: true,
});
```

# Solid Support

`tsdown` streamlines the development of Solid component libraries by integrating with [`rolldown-plugin-solid`](https://github.com/g-mero/rolldown-plugin-solid) or [`unplugin-solid`](https://github.com/unplugin/unplugin-solid). This integration allows you to bundle Solid components and automatically generate type declarations using modern TypeScript tools.

## Quick Start

For the fastest way to get started, use the Solid component starter template. This starter project comes pre-configured for Solid library development, so you can focus on building components right away.

```bash
npx create-tsdown@latest -t solid
```

## Minimal Example

To configure `tsdown` for a Solid library, use the following setup in your `tsdown.config.ts`:

```ts [tsdown.config.ts]
import solid from 'rolldown-plugin-solid'; // or use 'unplugin-solid/rolldown'
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
  plugins: [solid()],
});
```

Create your typical Solid component:

```tsx [MyButton.tsx]
import type { Component } from 'solid-js';

interface MyButtonProps {
  type?: 'primary';
}

export const MyButton: Component<MyButtonProps> = ({ type }) => {
  return (
    <button class="my-button">
      my button: type
      {type}
    </button>
  );
};
```

And export it in your entry file:

```ts [index.ts]
export { MyButton } from './MyButton';
```

Install the required dependencies:

::: code-group

```sh [npm]
npm install -D rolldown-plugin-solid
```

```sh [pnpm]
pnpm add -D rolldown-plugin-solid
```

```sh [yarn]
yarn add -D rolldown-plugin-solid
```

```sh [bun]
bun add -D rolldown-plugin-solid
```

:::

or, if you prefer to use `unplugin-solid`:

::: code-group

```sh [npm]
npm install -D unplugin-solid
```

```sh [pnpm]
pnpm add -D unplugin-solid
```

```sh [yarn]
yarn add -D unplugin-solid
```

```sh [bun]
bun add -D unplugin-solid
```

:::

# Source Maps

Source maps bridge the gap between your original development code and the optimized code that runs in the browser or other environments, making debugging significantly easier. They allow you to trace errors and logs back to the original source files, even if the code has been minified or bundled.

For example, source maps enable you to identify which line in your React or Vue component caused an error, even though the runtime environment only sees the bundled or minified code.

### Enabling Source Maps

You can instruct `tsdown` to generate source maps by using the `--sourcemap` option:

```bash
tsdown --sourcemap
```

Note that source map will always be enabled if you have [`declarationMap`](https://www.typescriptlang.org/tsconfig/#declarationMap) option enabled in your `tsconfig.json`.

# Target

The `target` setting determines which JavaScript and CSS features are downleveled (transformed to older syntax) and which are left intact in the output. This allows you to control the compatibility of your bundled code with specific environments or JavaScript versions.

For example, a logical assignment `a ||= b` will be transformed into an equivalent `a || (a = b)` expression if the target is `es2015`.

> [!WARNING] Syntax Downgrade Only
> The `target` option only affects syntax transformations. It does not include runtime polyfills or shims for APIs that may not exist in the target environment. For example, if your code uses `Promise`, it will not be polyfilled for environments that lack native `Promise` support.

## Default Target Behavior

By default, `tsdown` will read the `engines.node` field from your `package.json` and automatically set the target to the minimum compatible Node.js version specified. This ensures your output is compatible with the environments you declare for your package.

For example, if your `package.json` contains:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Then `tsdown` will automatically set the target to `node18.0.0`.

If you want to override this behavior, you can specify the target explicitly using the CLI or configuration file.

## Disabling Target Transformations

You can disable all syntax transformations by setting the target to `false`. This will preserve modern JavaScript and CSS syntax in the output, regardless of the environment specified in your `package.json`.

```json
{
  "target": false
}
```

When `target` is set to `false`:

- No JavaScript syntax downleveling occurs (modern features like optional chaining `?.`, nullish coalescing `??`, etc. are preserved)
- No CSS syntax transformations are applied (modern CSS features like nesting are preserved)
- No runtime helper plugins are loaded
- The output will use the exact syntax from your source code

This is particularly useful when:

- You're targeting modern environments that support the latest JavaScript/CSS features
- You want to handle syntax transformations in a different build step
- You're building a library that will be further processed by the consuming application

> [!NOTE] No Target Resolution
> If you don't specify a `target` and your `package.json` doesn't have an `engines.node` field, `tsdown` will behave as if `target: false` was set, preserving all modern syntax.

## Customizing the Target

You can specify the target using the `--target` option:

```bash
tsdown --target <target>
```

### Supported Targets

- ECMAScript versions: `es2015`, `es2020`, `esnext`, etc.
- Browser versions: `chrome100`, `safari18`, `firefox110`, etc.
- Node.js versions: `node20.18`, `node16`, etc.

### Example

```bash
tsdown --target es2020
```

You can also pass an array of targets to ensure compatibility across multiple environments:

```bash
tsdown --target chrome100 --target node20.18
```

### Decorator Support

There are currently two major implementations of decorators in the JavaScript ecosystem:

- **Stage 2 (Legacy) Decorators**: The older, experimental implementation, often referred to as "legacy decorators."
- **Stage 3 Decorators**: The latest official proposal, which is significantly different from the legacy version.

If you are using **stage 2 (legacy) decorators**, make sure to enable the `experimentalDecorators` option in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

If you need to use the **latest TC39 Stage 3 decorators**, please note that `tsdown` (and its underlying engines, Rolldown/Oxc) **do not currently support this feature**. For more information and updates on Stage 3 decorator support, see [this GitHub issue](https://github.com/oxc-project/oxc/issues/9170#issuecomment-3354571325).

> **Note:**
> The two decorator implementations are very different. Make sure you are using the correct configuration and syntax for your chosen decorator version.

# CSS Targeting

`tsdown` can also downlevel CSS features to match your specified browser targets. For example, a CSS nesting `&` selector will be flattened if the target is `chrome108` or lower.

To enable CSS downleveling, you need to manually install [`unplugin-lightningcss`](https://github.com/unplugin/unplugin-lightningcss):

::: code-group

```sh [npm]
npm install -D unplugin-lightningcss
```

```sh [pnpm]
pnpm add -D unplugin-lightningcss
```

```sh [yarn]
yarn add -D unplugin-lightningcss
```

```sh [bun]
bun add -D unplugin-lightningcss
```

:::

Once installed, simply set your browser target (for example, `target: 'chrome100'`) in your configuration or CLI options, and CSS downleveling will be enabled automatically.

For more information on browser targets and CSS compatibility, refer to the [Lightning CSS documentation](https://lightningcss.dev/).

# Tree-shaking

Tree shaking is a process that eliminates unused (dead) code from your final bundle, reducing its size and improving performance. It ensures that only the code you actually use is included in the output.

Tree shaking is **enabled by default** in `tsdown`, but you can disable it if needed:

```bash
tsdown --no-treeshake
```

### Example

Given the following input code:

::: code-group

```ts [src/index.ts]
import { hello } from './util';

const x = 1;

hello(x);
```

```ts [src/util.ts]
export function unused() {
  console.log("I'm unused.");
}

export function hello(x: number) {
  console.log('Hello World');
  console.log(x);
}
```

:::

Here are the two possible outputs, depending on whether tree shaking is enabled:

::: code-group

```js [dist/index.mjs (with tree shaking)]
function hello(x$1) {
  console.log('Hello World');
  console.log(x$1);
}

const x = 1;
hello(x);
```

```js [dist/index.mjs (without tree shaking)]
function unused() {
  console.log("I'm unused.");
}
function hello(x$1) {
  console.log('Hello World');
  console.log(x$1);
}

const x = 1;
hello(x);
```

:::

### Explanation

- **With Tree Shaking:** The `unused` function is removed from the final bundle because it is not called anywhere in the source code.
- **Without Tree Shaking:** The `unused` function is included in the bundle, even though it is not used, resulting in a larger output.

> [!TIP]
> Tree shaking is particularly useful for optimizing libraries or large projects with many unused exports. However, if you need to include all code (e.g., for debugging or testing), you can disable it with `--no-treeshake`.

# Unbundle Mode

The **unbundle** mode in `tsdown` allows you to output files that closely mirror your source module structure, rather than producing a single bundled file for each entry. In this mode, each source file is compiled and transformed individually, and the output directory will contain a one-to-one mapping of your source files to output files. This approach is often referred to as a "bundleless" or "transpile-only" build, where the focus is on transforming code rather than bundling it together.

## How to Enable

You can enable unbundle mode by setting the `unbundle` option to `true` in your `tsdown` configuration:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  unbundle: true,
});
```

## How It Works

When unbundle mode is enabled, every source file that is referenced (directly or indirectly) from your entry points will be compiled and output to the corresponding location in the output directory. This means that the output structure will closely match your source directory structure, making it easy to trace output files back to their original source files.

### Example

Suppose your project has the following files:

```
src/
  index.ts
  mod.ts
```

And `src/index.ts` imports `src/mod.ts`:

```ts [src/index.ts]
import { foo } from './mod';

foo();
```

```ts [src/mod.ts]
export function foo() {
  console.log('Hello from mod!');
}
```

With `unbundle: true`, even though only `src/index.ts` is listed as an entry, both `src/index.ts` and `src/mod.ts` will be compiled and output as separate files:

```
dist/
  index.js
  mod.js
```

Each output file corresponds directly to its source file, preserving the module structure of your original codebase.

## When to Use Unbundle Mode

Unbundle mode is ideal when you want to:

- Maintain a clear mapping between source and output files.
- Avoid bundling all modules together, for example in monorepo or library scenarios where consumers may want to import individual modules.
- Focus on code transformation (e.g., TypeScript to JavaScript) without combining files.

# Vue Support

`tsdown` provides first-class support for building Vue component libraries by seamlessly integrating with [`unplugin-vue`](https://github.com/unplugin/unplugin-vue) and [`rolldown-plugin-dts`](https://github.com/sxzz/rolldown-plugin-dts). This setup enables you to bundle Vue components and generate type declarations with modern TypeScript tooling.

## Quick Start

For the fastest way to get started, use the Vue component starter template. This starter project comes pre-configured for Vue library development, so you can focus on building components right away.

```bash
npx create-tsdown@latest -t vue
```

## Minimal Example

To configure `tsdown` for a Vue library, use the following setup in your `tsdown.config.ts`:

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },
});
```

Install the required dependencies:

::: code-group

```sh [npm]
npm install -D unplugin-vue vue-tsc
```

```sh [pnpm]
pnpm add -D unplugin-vue vue-tsc
```

```sh [yarn]
yarn add -D unplugin-vue vue-tsc
```

```sh [bun]
bun add -D unplugin-vue vue-tsc
```

:::

## How It Works

- **`unplugin-vue`** compiles `.vue` single-file components into JavaScript and extracts CSS, making them ready for bundling.
- **`rolldown-plugin-dts`** (with `vue: true`) and **`vue-tsc`** work together to generate accurate TypeScript declaration files for your Vue components, ensuring consumers of your library get full type support.

> [!TIP]
> Set `platform: 'neutral'` to maximize compatibility for libraries that may be used in both browser and Node.js environments.

# Watch Mode

Watch mode allows `tsdown` to automatically re-bundle your code whenever changes are detected in the specified files or directories. This is particularly useful during development to streamline the build process.

### Enabling Watch Mode

You can enable watch mode using the `--watch` (or `-w`) option:

```bash
tsdown --watch
```

### Watching Specific Paths

By default, `tsdown` watches the files in your project that are part of the build process. However, you can specify a custom path to watch for changes:

```bash
tsdown --watch <path>
```

### Example

```bash
# Watch all files in the project (default behavior)
tsdown --watch

# Watch a specific directory
tsdown --watch ./src

# Watch a specific file
tsdown --watch ./src/index.ts
```

> [!TIP]
> Watch mode is ideal for development workflows, as it eliminates the need to manually rebuild your project after every change.
