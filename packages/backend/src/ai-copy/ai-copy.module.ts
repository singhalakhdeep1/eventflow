import { Module } from '@nestjs/common';
import { AICopyService } from './ai-copy.service';
import { AiCopyController } from './ai-copy.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiCopyController],
  providers: [AICopyService],
  exports: [AICopyService],
})
export class AICopyModule {}
