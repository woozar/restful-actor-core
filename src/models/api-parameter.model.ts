import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { ApiMethod } from './api-method.model';
import { ApiPath } from './api-path.model';

@ObjectType()
export class ApiParameter {
  @Field(() => String)
  get name(): string {
    return this.rawData.name;
  }

  @Field(() => ParameterIn)
  get paramIn(): ParameterIn {
    return this.rawData.in;
  }

  @Field(() => Boolean)
  get required(): boolean {
    return this.rawData.required;
  }

  @Field()
  get schema(): string {
    return JSON.stringify(this.rawData.schema);
  }

  @Field(() => String, { nullable: true, description: 'the example for the object serialized as string' })
  get example(): string | null {
    return JSON.stringify(this.rawData.example) ?? null;
  }

  @Field(() => [String])
  public get namespace(): string[] {
    return [...(this.parent?.namespace ?? []), this.name];
  }

  constructor(public parent: ApiPath | ApiMethod, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
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
