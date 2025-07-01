import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../shared/role';

export class ChangeRoleDto {
  @IsEnum(Role, { message: 'Invalid role value' })
  role: Role;
}
