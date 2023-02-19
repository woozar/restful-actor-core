import { Module } from '@nestjs/common';
import { ApiSpecResolver } from './api-specs.resolver';
import { ApiSpecsService } from './api-specs.service';

@Module({
  controllers: [],
  providers: [ApiSpecsService, ApiSpecResolver],
})
export class ApiModule {}
