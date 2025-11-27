export default function matchPackageNameInCommit(name: string): RegExp {
  return new RegExp(`\\[${name}\\]|\\(${name}\\)`, 'i');
}
