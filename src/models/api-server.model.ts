import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError as NsError } from 'src/ns-error';
import { ApiSpec } from './api-spec.model';
import { ApiVariable } from './api-variable.model';

@ObjectType()
export class ApiServer {
  @Field(() => String, { nullable: true })
  public get description(): string {
    return this.rawData.description ?? null;
  }

  @Field(() => String)
  public get url(): string {
    return this.rawData.url;
  }

  @Field(() => [ApiVariable])
  public get variables(): ApiVariable[] {
    const { variables } = this.rawData;
    return Object.keys(variables ?? []).map((variableName: any) => new ApiVariable(this, variableName, variables[variableName], this.specService));
  }

  @Field(() => ApiSpec)
  public parent: ApiSpec;

  @Field(() => [String])
   public get namespace(): string[] {
    return [...(this.parent.namespace ?? []), `server: ${this.url}`];
  }

  constructor(parent: ApiSpec, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData();
  }

  private validateRawData(): void {
    const { url } = this.rawData;
    if (!url) throw NsError.missingMandatoryProperty(this, 'url');
    if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      throw new NsError([...this.namespace, `server: ${url}`], 'url must be a string that starts with http:// or https://');
    }
    this.validateVariablesRawData();
  }

  private validateVariablesRawData(): void {
    const { variables } = this.rawData;
    if (!variables) return;
    if (!Array.isArray(variables)) throw NsError.notAnArray(this, 'variables');
    for (const variable of variables ?? []) {
      if (typeof variable !== 'object') throw NsError.arrayItemWrongType(this, 'variables', typeof variable, 'object');
    }
  }
}
