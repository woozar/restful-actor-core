export class NsError extends Error {
  constructor(public namespace: string[], message: string) {
    super(message);
  }

  public static notNullOrString({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `the property [${property}] must be null or a string`);
  }

  public static notAStringOrEmpty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `the property [${property}] must be a string and not empty`);
  }

  public static notAnArray({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `the property [${property}] must be an array`);
  }

  public static notARecord({ namespace }: { namespace: string[] }, property: string, type: string): NsError {
    return new NsError(namespace, `the property [${property}] must be a map string -> ${type}`);
  }

  public static typeMissmatch({ namespace }: { namespace: string[] }, property: string, type: string, expectedType: string): NsError {
    return new NsError(namespace, `the property [${property}] is not a ${expectedType} but a ${type}`);
  }

  public static arrayItemWrongType({ namespace }: { namespace: string[] }, property: string, type: string, expectedType: string): NsError {
    return new NsError(namespace, `at least one item of the array in property [${property}] is a ${type} instead of ${expectedType}`);
  }

  public static missingPlaceholder({ namespace }: { namespace: string[] }, entityType: string, entityId: string, placeholder: string): NsError {
    return new NsError(namespace, `the ${entityType} [${entityId}] does not contain the placeholder {${placeholder}}`);
  }

  public static missingMandatoryProperty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `the mandatory property [${property}] is missing or empty`);
  }

  public static unexpectedProperty({ namespace }: { namespace: string[] }, property: string): NsError {
    return new NsError(namespace, `unexpected property [${property}]`);
  }

  public static invalidEnumValue({ namespace }: { namespace: string[] }, value: string, enumValues: string[], enumName?: string): NsError {
    const validValues = enumValues.map((item: string) => `"${item}"`).join(', ');
    const eName = enumName ? ` for [${enumName}]` : '';
    throw new NsError(namespace, `[${value}] is not a valid value${eName}. (Valid values: [${validValues}])`);
  }
}
