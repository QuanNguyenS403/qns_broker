import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @ApiPropertyOptional({ description: 'Đánh giá số sao từ 1 đến 5', minimum: 1, maximum: 5, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Nội dung chi tiết (tối thiểu 10 ký tự, tối đa 2000 ký tự)', example: 'Giao diện web rất trực quan và dễ tìm phòng' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  @MinLength(10, { message: 'Nội dung phản hồi phải có tối thiểu 10 ký tự' })
  @MaxLength(2000, { message: 'Nội dung phản hồi không được vượt quá 2000 ký tự' })
  content!: string;

  @ApiPropertyOptional({ description: 'Tên người gửi', example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Email người gửi', example: 'email@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(150)
  email?: string;
}
