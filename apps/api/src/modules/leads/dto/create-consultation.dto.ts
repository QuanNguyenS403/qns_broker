import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({ description: 'Số điện thoại liên hệ', example: '0912345678' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^(03|05|07|08|09)\d{8}$/, {
    message: 'Số điện thoại không hợp lệ, vui lòng nhập số di động 10 chữ số',
  })
  phone!: string;

  @ApiProperty({ description: 'Lý do cần tư vấn', example: 'Khác' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn lý do cần tư vấn' })
  @MaxLength(150)
  reason!: string;

  @ApiPropertyOptional({ description: 'Mô tả thêm chi tiết', maxLength: 2000, example: 'Cần tìm phòng quanh khu vực Cầu Giấy' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không được vượt quá 2000 ký tự' })
  description?: string;

  @ApiPropertyOptional({ description: 'Danh sách ID phòng đã chọn (nếu có)', type: [String] })
  @IsOptional()
  @IsArray()
  selectedRoomIds?: string[];
}
