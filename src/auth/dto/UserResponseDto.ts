import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  roleId: number;
}
