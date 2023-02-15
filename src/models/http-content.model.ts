import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiMethod } from './api-method.model';
import { ApiResponse } from './api-response.model';

const HttpContentParent = createUnionType({ name: 'HttpContentParent', types: () => [ApiResponse, ApiMethod] as const });

@ObjectType()
export class HttpContent {
  @Field()
  mimetype: string;

  @Field(() => String, { nullable: true })
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
    }
    return schema;
  }

  @Field()
  public get example(): string {
    return JSON.stringify(this.rawSchema.example);
  }

  @Field(() => HttpContentParent)
  parent: ApiResponse | ApiMethod;

   public get namespace(): string[] {
    return [...this.parent.namespace, `header: ${this.mimetype}`];
  }

  constructor(parent: ApiResponse | ApiMethod, mimetype: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(mimetype);
    this.mimetype = mimetype;
  }

  private validateRawData(mimetype: any): void {
    // ToDo validate mimeType
    const { description, schema } = this.rawData;
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
    if (!schema) throw NsError.missingMandatoryProperty(this, 'schema');
    if (typeof schema !== 'object') throw NsError.typeMissmatch(this, 'schema', typeof schema, 'object');
  }
}
