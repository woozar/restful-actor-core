import { Field, ObjectType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Response } from './response.model';

@ObjectType()
export class HttpHeader {
  @Field()
  name: string;

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string {
    return this.rawData.description ?? null;
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

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get example(): string | null {
    return this.rawData.example ? JSON.stringify(this.rawData.example) : null;
  }

  @Field(/* istanbul ignore next */ () => Response)
  parent: Response;

  public get namespace(): string[] {
    return [...this.parent.namespace, `header: ${this.name}`];
  }

  constructor(parent: Response, name: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(name);
    this.name = name;
  }

  private validateRawData(name: any): void {
    if (!name || typeof name !== 'string') throw NsError.notAStringOrEmpty(this, 'name');
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { description, schema } = this.rawData;
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
    if (!schema) throw NsError.missingMandatoryProperty(this, 'schema');
    if (typeof schema !== 'object') throw NsError.typeMissmatch(this, 'schema', typeof schema, 'object');
  }
}
