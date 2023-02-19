import { createUnionType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Method } from './method.model';
import { Path } from './path.model';

const ParameterParent = createUnionType({ name: 'ParameterParent', types: /* istanbul ignore next */ () => [Path, Method] as const });

@ObjectType()
export class Parameter {
  @Field(/* istanbul ignore next */ () => String)
  public get name(): string {
    return this.rawData?.name;
  }

  @Field(/* istanbul ignore next */ () => ParameterIn)
  public get paramIn(): ParameterIn {
    return this.rawData.in;
  }

  @Field(/* istanbul ignore next */ () => Boolean)
  public get required(): boolean {
    return this.rawData.required;
  }

  @Field()
  public get schema(): string {
    return JSON.stringify(this.rawSchema);
  }
  public get rawSchema(): any {
    let { schema } = this.rawData;
    if (schema.$ref) {
      schema = this.specService.followRef(this, schema.$ref);
      this.rawData.schema = schema;
    }
    return schema;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true, description: 'the example for the object serialized as string' })
  public get example(): string | null {
    return JSON.stringify(this.rawData.example) ?? null;
  }

  @Field(/* istanbul ignore next */ () => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `parameter: ${this.name}`];
  }

  @Field(/* istanbul ignore next */ () => ParameterParent)
  public parent: Path | Method;

  constructor(parent: Path | Method, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData();
  }

  private validateRawData(): void {
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { required, in: paramIn, schema } = this.rawData;
    const paramInValues = Object.values(ParameterIn);
    if (!this.rawData.name) throw NsError.missingMandatoryProperty(this, 'name');
    if (paramIn === undefined) throw NsError.missingMandatoryProperty(this, 'in');
    if (!paramIn || !paramInValues.includes(paramIn)) throw NsError.invalidEnumValue(this, 'in', paramIn, paramInValues, 'ParameterIn');
    if (required === undefined) throw NsError.missingMandatoryProperty(this, 'required');
    if (typeof required !== 'boolean') throw NsError.typeMissmatch(this, 'required', typeof required, 'boolean');
    if (!schema) throw NsError.missingMandatoryProperty(this, 'schema');
    if (typeof schema !== 'object') throw NsError.typeMissmatch(this, 'schema', typeof schema, 'object');
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
