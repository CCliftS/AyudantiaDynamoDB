import { Module } from '@nestjs/common';
import { DynamoController } from './dynamo.controller';
import { DynamoService } from './dynamo.service';

@Module({
  controllers: [DynamoController],
  providers: [DynamoService],
})
export class DynamoModule {}
