import { Field, ObjectType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Path as Path } from './path.model';
import { Server } from './server.model';

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

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string {
    return this.rawData.info.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => [Server])
  public get servers(): Server[] {
    return this.rawData.servers?.map((server: any) => new Server(this, server, this.specService)) ?? [];
  }

  @Field(/* istanbul ignore next */ () => [Path])
  public get paths(): Path[] {
    const { paths } = this.rawData;
    return Object.keys(paths).map((path) => new Path(this, path, paths[path], this.specService));
  }

  public get namespace(): string[] {
    return [`${this.id}`];
  }

  constructor(id: string, private rawData: any, private specService: ApiSpecsService) {
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(id);
    this.id = id;
  }

  private validateRawData(id: any): void {
    if (!id || typeof id !== 'string') throw NsError.notAStringOrEmpty(this, 'id');
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { openapi, paths, info } = this.rawData;
    if (!openapi) throw NsError.missingMandatoryProperty(this, 'openapi');
    if (!validOpenApiVersions.includes(openapi)) throw NsError.invalidEnumValue(this, 'openapi', openapi, validOpenApiVersions, 'openapi');
    if (!info) throw NsError.missingMandatoryProperty(this, 'info');
    const { title, description } = info;
    if (!title || typeof title !== 'string') throw NsError.notAStringOrEmpty(this, 'info.title');
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'info.description');
    if (!paths || Object.keys(paths).length === 0) throw NsError.missingMandatoryProperty(this, 'paths');
    if (typeof paths !== 'object' || Array.isArray(paths) || Object.keys(paths).some((path) => typeof paths[path] !== 'object')) {
      throw NsError.notARecord(this, 'paths', 'Object');
    }
  }
}

const validOpenApiVersions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];
