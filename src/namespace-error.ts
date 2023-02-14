export class NamespaceError extends Error {
  constructor(public namespace: string[], message: string) {
    super(message);
  }
}
