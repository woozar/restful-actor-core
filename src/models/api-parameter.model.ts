import { createUnionType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { ApiMethod } from './api-method.model';
import { ApiPath } from './api-path.model';

const ParameterParent = createUnionType({ name: 'ParameterParent', types: () => [ApiPath, ApiMethod] as const });

@ObjectType()
export class ApiParameter {
  @Field(() => String)
  public get name(): string {
    return this.rawData.name;
  }

  @Field(() => ParameterIn)
  public get paramIn(): ParameterIn {
    return this.rawData.in;
  }

  @Field(() => Boolean)
  public get required(): boolean {
    return this.rawData.required;
  }

  @Field()
  public get schema(): string {
    return JSON.stringify(this.rawData.schema);
  }

  @Field(() => String, { nullable: true, description: 'the example for the object serialized as string' })
  public get example(): string | null {
    return JSON.stringify(this.rawData.example) ?? null;
  }

  @Field(() => [String])
   public get namespace(): string[] {
    return [...this.parent.namespace, `parameter: ${this.name}`];
  }

  @Field(() => ParameterParent)
  public parent: ApiPath | ApiMethod;

  constructor(parent: ApiPath | ApiMethod, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData();
  }

  private validateRawData(): void {
    // ToDo
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
