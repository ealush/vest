import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

import ts from 'typescript';

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2021,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  jsx: ts.JsxEmit.Preserve,
  esModuleInterop: true,
  sourceMap: true,
};

const VX_ROOT = new URL('./', import.meta.url);

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

  return next(url, context);
}
