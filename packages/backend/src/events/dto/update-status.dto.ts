import { IsString, IsEnum } from 'class-validator';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ONGOING = 'ONGOING',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;
}

