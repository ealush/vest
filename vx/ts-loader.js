import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

import ts from 'typescript';

const compilerOptions = {
  esModuleInterop: true,
  jsx: ts.JsxEmit.Preserve,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  sourceMap: true,
  target: ts.ScriptTarget.ES2021,
};

const VX_ROOT = new URL('./', import.meta.url);

// eslint-disable-next-line complexity
export async function resolve(specifier, context, next) {
  // Safety: Defer to next hook for non-file parent URLs (e.g. data:, node:)
  // This prevents resolving relative paths against virtual modules/data URIs
  if (context.parentURL && !context.parentURL.startsWith('file://')) {
    return next(specifier, context);
  }

  if (specifier.startsWith('vx/')) {
    const relativePath = specifier.replace(/^vx\//, '');
    const baseUrl = new URL(relativePath, VX_ROOT);
    const basePath = fileURLToPath(baseUrl);
    const tsPath = basePath.replace(/\.js$/, '.ts');

    if (fs.existsSync(tsPath)) {
      return { url: pathToFileURL(tsPath).href, shortCircuit: true };
    }

    if (fs.existsSync(basePath)) {
      return { url: pathToFileURL(basePath).href, shortCircuit: true };
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    specifier.endsWith('.js') &&
    context.parentURL
  ) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolvedPath = path.resolve(path.dirname(parentPath), specifier);
    const tsCandidate = resolvedPath.replace(/\.js$/, '.ts');

    if (fs.existsSync(tsCandidate)) {
      return { url: pathToFileURL(tsCandidate).href, shortCircuit: true };
    }
  }

  return next(specifier, context);
}

export async function load(url, context, next) {
  // Guard: Critical fix for Node 20+ loader bootstrap.
  // We must strictly ignore data: URLs (used by --import) and node: internals.
  // Intercepting these causes the ERR_INVALID_RETURN_PROPERTY_VALUE crash.
  if (!url.startsWith('file://')) {
    return next(url, context);
  }

  if (url.endsWith('.ts')) {
    const source = await readFile(new URL(url), 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions,
      fileName: fileURLToPath(url),
    });

    const sourceMap = transpiled.sourceMapText
      ? `//# sourceMappingURL=data:application/json;base64,${Buffer.from(
          transpiled.sourceMapText,
        ).toString('base64')}`
      : '';

    return {
      format: 'module',
      source: `${transpiled.outputText}\n${sourceMap}`,
      shortCircuit: true,
    };
  }

  // Clean fallthrough for all other file:// URLs (js, json, etc.)
  return next(url, context);
}
