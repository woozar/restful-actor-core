import { Injectable } from '@nestjs/common';

@Injectable()
export class SchemaService {
  public registerSchema(ref: string, schema: any): void {
    // ToDo
  }

  public validateSchema(obj: any, schema: any): void {
    // ToDo
  }

  public generateExample(schema: any): any {
    // ToDo
  }
}
