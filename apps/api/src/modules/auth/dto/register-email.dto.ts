import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class RegisterEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @MinLength(2, { message: 'Họ và tên tối thiểu 2 ký tự' })
  fullName!: string;

  @ApiProperty({ example: 'MatKhau@123' })
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password!: string;
}
