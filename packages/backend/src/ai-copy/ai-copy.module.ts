import { Module } from '@nestjs/common';
import { AICopyService } from './ai-copy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AICopyService],
  exports: [AICopyService],
})
export class AICopyModule {}
