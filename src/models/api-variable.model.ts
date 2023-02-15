import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiServer } from './api-server.model';

@ObjectType()
export class ApiVariable {
  @Field()
  name: string;

  @Field(() => [String], { nullable: true })
  public get enum(): string[] {
    return this.rawData.enum ?? [];
  }

  @Field(() => [String])
  public get default(): string[] {
    return this.rawData.default;
  }

  @Field(() => String, { nullable: true })
  public get description(): string {
    return this.rawData.description ?? null;
  }

  @Field(() => [String])
   public get namespace(): string[] {
    return [...this.parent.namespace, `variable: ${this.name}`];
  }

  constructor(public parent: ApiServer, name: string, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(name);
    this.name = name;
  }

  private validateRawData(name: any): void {
    const { description } = this.rawData;
    if (!name || typeof name !== 'string') throw NsError.notAStringOrEmpty(this, 'name');
    if (!this.parent.url.includes(`{${name}}`)) {
      throw NsError.missingPlaceholder(this, 'server url', this.parent.url, name);
    }
    if (!this.rawData.default || typeof this.rawData.default !== 'string') throw NsError.notAStringOrEmpty(this, 'default');
    this.validateEnum();
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
  }

  private validateEnum(): void {
    if (!this.rawData.enum) {
      // ok
    } else if (!Array.isArray(this.rawData.enum)) {
      throw NsError.notAnArray(this, 'enum');
    } else if (!this.rawData.enum.includes(this.rawData.default)) {
      throw NsError.invalidEnumValue({ namespace: [...this.namespace, 'enum', 'default'] }, this.rawData.default, this.rawData.enum);
    } else {
      for (let i = 0; i < this.rawData.enum; i++) {
        const e = this.rawData.enum[i];
        if (!e || typeof e !== 'string') throw NsError.notAStringOrEmpty(this, `enum[${i}]`);
      }
    }
  }
}
