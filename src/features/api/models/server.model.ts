import { Field, ObjectType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { ApiSpec } from './spec.model';
import { Variable } from './variable.model';

@ObjectType()
export class Server {
  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string {
    return this.rawData.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => String)
  public get url(): string {
    return this.rawData?.url;
  }

  @Field(/* istanbul ignore next */ () => [Variable])
  public get variables(): Variable[] {
    const { variables } = this.rawData;
    return Object.keys(variables ?? {}).map((variableName: any) => new Variable(this, variableName, variables[variableName], this.specService));
  }

  @Field(/* istanbul ignore next */ () => ApiSpec)
  public parent: ApiSpec;

  @Field(/* istanbul ignore next */ () => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `server: ${this.url}`];
  }

  constructor(parent: ApiSpec, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData();
  }

  private validateRawData(): void {
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { url } = this.rawData;
    if (!url) throw NsError.missingMandatoryProperty(this, 'url');
    if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      throw new NsError([...this.namespace, `server: ${url}`], '[url] must be a string that starts with http:// or https://');
    }
    this.validateVariablesRawData();
  }

  private validateVariablesRawData(): void {
    const { variables } = this.rawData;
    if (!variables) return;
    if (Array.isArray(variables)) throw NsError.notARecord(this, 'variables', 'object');
    for (const variableName of Object.keys(variables)) {
      const variable = variables[variableName];
      if (typeof variable !== 'object') throw NsError.notARecord(this, 'variables', 'object');
    }
  }
}
