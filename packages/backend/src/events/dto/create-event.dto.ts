import { IsString, IsDate, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  venue: string;

  @IsDate()
  eventDate: Date;

  @IsNumber()
  @Min(1)
  totalTickets: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
