import { Field, ObjectType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Server } from './server.model';

@ObjectType()
export class Variable {
  @Field()
  name: string;

  @Field(/* istanbul ignore next */ () => [String], { nullable: true })
  public get enum(): string[] {
    return this.rawData.enum ?? null;
  }

  @Field(/* istanbul ignore next */ () => [String])
  public get default(): string[] {
    return this.rawData.default;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string {
    return this.rawData.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `variable: ${this.name}`];
  }

  @Field(/* istanbul ignore next */ () => Server)
  public parent: Server;

  constructor(parent: Server, name: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(name);
    this.name = name;
  }

  private validateRawData(name: any): void {
    if (!name || typeof name !== 'string') throw NsError.notAStringOrEmpty(this, 'name');
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { description } = this.rawData;
    if (!this.parent.url.includes(`{${name}}`)) {
      throw NsError.missingPlaceholder(this, 'server url', this.parent.url, name);
    }
    const { default: defaultValue } = this.rawData;
    if (!defaultValue) throw NsError.missingMandatoryProperty(this, 'default');
    if (typeof defaultValue !== 'string') throw NsError.notAStringOrEmpty(this, 'default');
    this.validateEnum();
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
  }

  private validateEnum(): void {
    const { default: defaultValue, enum: enumValues } = this.rawData;
    if (!enumValues) {
      // ok
    } else if (!Array.isArray(enumValues)) {
      throw NsError.notAnArray(this, 'enum');
    } else if (!enumValues.includes(defaultValue)) {
      throw NsError.invalidEnumValue({ namespace: [...this.namespace, 'enum', 'default'] }, 'default', defaultValue, enumValues);
    } else {
      for (let i = 0; i < enumValues.length; i++) {
        const e = enumValues[i];
        if (!e || typeof e !== 'string') throw NsError.notAStringOrEmpty(this, `enum[${i}]`);
      }
    }
  }
}
