export function isJavaScriptAction(main: string | undefined): boolean {
  return !!main && main !== 'composite' && main !== 'docker';
}
