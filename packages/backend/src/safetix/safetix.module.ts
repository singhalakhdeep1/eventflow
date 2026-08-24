import { Module } from '@nestjs/common';
import { SafeTixService } from './safetix.service';
import { SafetixController } from './safetix.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SafetixController],
  providers: [SafeTixService],
  exports: [SafeTixService],
})
export class SafeTixModule {}
