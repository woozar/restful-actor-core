export class NsError extends Error {
  constructor(public namespace: string[], message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public static notNullOrString({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `[${property}] must be null or a string`);
  }

  public static notAStringOrEmpty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `[${property}] must be a string and not empty`);
  }

  public static notAnArray({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `[${property}] must be an array`);
  }

  public static notAnObject({ namespace }: { namespace: string[] }): NsError {
    return new NsError(namespace, `this is not based on an object`);
  }

  public static notARecord({ namespace }: { namespace: string[] }, property: string, type: string): NsError {
    return new NsError(namespace, `[${property}] must be a map string -> ${type}`);
  }

  public static typeMissmatch({ namespace }: { namespace: string[] }, property: string, type: string, expectedType: string): NsError {
    return new NsError(namespace, `[${property}] is not a ${expectedType} but a ${type}`);
  }

  public static arrayItemWrongType({ namespace }: { namespace: string[] }, property: string, type: string, expectedType: string): NsError {
    return new NsError(namespace, `[${property}] at least one item of the array is a "${type}" instead of a "${expectedType}"`);
  }

  public static missingPlaceholder({ namespace }: { namespace: string[] }, entityType: string, entityId: string, placeholder: string): NsError {
    return new NsError(namespace, `the ${entityType} [${entityId}] does not contain the placeholder {${placeholder}}`);
  }

  public static missingMandatoryProperty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `[${property}] mandatory property missing or empty`);
  }

  public static unexpectedProperty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `[${property}] unexpected property`);
  }

  public static invalidEnumValue({ namespace }: { namespace: string[] }, property: string, value: string, enumValues: string[], enumName?: string): NsError {
    const validValues = enumValues.map((item: string) => `"${item}"`).join(', ');
    const eName = enumName ? ` for [${enumName}]` : '';
    throw new NsError(namespace, `[${property}] "${value}" is not a valid value${eName}. (Valid values: [${validValues}])`);
  }
}
