import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone!: string;

  @ApiPropertyOptional({
    enum: ['register', 'reset_password', 'lead_verification', 'general'],
    example: 'register',
    description: 'Mục đích gửi OTP: đăng ký, đặt lại mật khẩu, hoặc xác minh lead',
  })
  @IsOptional()
  @IsIn(['register', 'reset_password', 'lead_verification', 'general'], {
    message: 'Mục đích gửi OTP không hợp lệ',
  })
  purpose?: 'register' | 'reset_password' | 'lead_verification' | 'general';
}
