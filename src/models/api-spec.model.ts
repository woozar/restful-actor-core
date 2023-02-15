import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiPath as ApiPath } from './api-path.model';
import { ApiServer } from './api-server.model';

@ObjectType()
export class ApiSpec {
  public get openApi() {
    return this.rawData.openapi;
  }

  @Field()
  id: string;

  @Field()
  public get name(): string {
    return this.rawData.info.version ? `${this.rawData.info.title} ${this.rawData.info.version}` : this.rawData.info.title;
  }

  @Field(() => String, { nullable: true })
  public get description(): string {
    return this.rawData.info?.description ?? null;
  }

  @Field(() => [ApiServer])
  public get servers(): ApiServer[] {
    return this.rawData.servers?.map((server: any) => new ApiServer(this, server, this.specService)) ?? [];
  }

  @Field(() => [ApiPath])
  public get paths(): ApiPath[] {
    const { paths } = this.rawData;
    return Object.keys(paths).map((path) => new ApiPath(this, path, paths[path], this.specService));
  }

   public get namespace(): string[] {
    return [`${this.id}`];
  }

  constructor(id: string, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(id);
    this.id = id;
  }

  private validateRawData(id: any): void {
    const { openapi, paths, info } = this.rawData;
    if (!info) throw NsError.missingMandatoryProperty(this, 'info');
    const { title, description } = info;
    if (!id || typeof id !== 'string') throw NsError.notAStringOrEmpty(this, 'id');
    if (!title || typeof title !== 'string') throw NsError.notAStringOrEmpty(this, 'info.title');
    if (openapi && !validOpenApiVersions.includes(openapi)) throw NsError.invalidEnumValue(this, openapi, validOpenApiVersions, 'openapi');
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'info.description');
    if (!paths || typeof paths !== 'object' || Array.isArray(paths) || Object.keys(paths).some((path) => typeof paths[path] !== 'object')) {
      throw NsError.notARecord(this, 'paths', 'Object');
    }
  }
}

const validOpenApiVersions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];
