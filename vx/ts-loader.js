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

// eslint-disable-next-line complexity
export async function load(url, context, next) {
  if (url.endsWith('.ts')) {
    const source = await readFile(new URL(url), 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions,
      fileName: url,
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

  const result = await next(url, context);

  // Ensure source is returned if missing (fixes ERR_INVALID_RETURN_PROPERTY_VALUE in some environments)
  if (!result.source && result.format !== 'builtin') {
    try {
      const source = await readFile(new URL(url), 'utf8');
      return { ...result, source };
    } catch {
      // Ignore errors if file cannot be read (e.g. wasm or internal)
    }
  }

  return result;
}
