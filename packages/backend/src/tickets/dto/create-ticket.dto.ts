import { IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';

export enum TicketType {
  GENERAL = 'GENERAL',
  VIP = 'VIP',
  PREMIUM = 'PREMIUM',
}

export class CreateTicketDto {
  @IsString()
  eventId: string;

  @IsString()
  userId: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsString()
  @IsOptional()
  seatNumber?: string;
}
