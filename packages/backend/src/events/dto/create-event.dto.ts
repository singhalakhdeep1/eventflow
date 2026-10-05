import { IsString, IsNumber, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  description: string;

  @IsString()
  venueName: string;

  @IsString()
  venueAddress: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  category: string;

  @IsInt()
  @Min(1)
  totalSeats: number;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
