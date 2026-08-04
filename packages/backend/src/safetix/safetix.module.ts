import { Module } from '@nestjs/common';
import { SafeTixService } from './safetix.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SafeTixService],
  exports: [SafeTixService],
})
export class SafeTixModule {}
