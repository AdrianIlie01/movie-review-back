import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserEntity } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { UserInfoService } from "../user-info/user-info.service";
import * as jwt from "jsonwebtoken";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { OtpEntity } from "../otp/entities/otp.entity";
import { expirationTime } from "../auth/constants/constants";
import { StripeService } from "../stripe/stripe.service";
import { Action } from "../shared/action";
import { MailService } from "../mail/mail.service";
import { ResetForgottenPasswordDto } from "./dto/reset-forgotten-password.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { ChangeRoleDto } from "./dto/change-role.dto";
import { Status } from "../shared/status";

@Injectable()
export class UserService
{
  constructor(
   private UserInfoService: UserInfoService,
   private stripeService: StripeService,
   private mailService: MailService,

  ) {}
  async create(createUserDto: CreateUserDto) {
    try{

      const { username, password, email } = createUserDto;

      const user = new UserEntity();

      user.username = username;
      user.password = await bcrypt.hash(password, 10);
      user.email = email;


      const savedUser = await user.save();

      let data = {};

      if (savedUser) {
        const {password, refresh_token, ...restData} = savedUser;
        data = restData;
      }


      return data;

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async findAll() {
    try{
      const users: UserEntity[] = await UserEntity.find();

      const sanitizedUsers = users.map(({ password, stripe_customer_id, refresh_token, ...rest }) => rest);

      return sanitizedUsers;

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async findOne(id: string) {
    try{
      const  user = await UserEntity.findOne({
        where: {id: id}
      });

      const { password, ...data } = user;

      return data;

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async findOneByName(username: string) {
    try {
      return await UserEntity.findOne({
        where: {
          username: username,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOneReturnWithPass(id: string) {
    try{
      return await UserEntity.findOne({
        where: { id: id }
      });

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
  async checkEmailAvailability(email: string) {
    try{
      const  user = await UserEntity.findOne({
        where: { email: email },
      });


      if (user) {
        return {
          message: 'email taken',
        }
      } else {
        return {
          message: 'email available',
        }
      }

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async checkUsernameAvailability(username: string) {
    try{
      const  user = await UserEntity.findOne({
        where: { username: username },
      });


      if (user) {
        return {
          message: 'username taken',
        }
      } else {
        return {
          message: 'username available',
        }
      }

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async findUserByEmailOrUsername(identificator: string) {
    try{
      const  user = await UserEntity.findOne({
        where: [{ username: identificator }, { email: identificator }],
      });

      const { password, ...data } = user;

      return data;

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
  async enableDisable2fa(id: string) {
    try {
      const user = await UserEntity.findOne({
        where: {
          id: id,
        },
      });
      user.is_2_fa_active = !user.is_2_fa_active;
      await user.save();

      return {
        message: `${user.is_2_fa_active ? '2_fa.enabled' : '2_fa.disabled'}`,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async changeRole(changeRole: ChangeRoleDto, id:string) {
    try {
      const { role } = changeRole;
      const user = await UserEntity.findOne({ where: { id: id } });
      user.role = role;

      await user.save();
      return user.role;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try{
      const {username} = updateUserDto;

      const user = await UserEntity.findOne({where: { id: id }});
      const initialUsername = user.username;

      console.log('typeof' );
      console.log(typeof username);
      console.log(username.length);

      typeof username !== 'undefined'
        ? (user.username = username)
        : (user.username = initialUsername);

      // username.length > 0
      //   ? (user.username = username)
      //   : (user.username = initialUsername);
      //
      const savedUser = await user.save();

      if (savedUser.username !== initialUsername) {
        await this.stripeService.updateCustomerName(
          user.id,
          savedUser.username,
        );
      }

      return {
        message: 'user.updated',
      };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async banUser(id: string) {
    try{
      const user = await UserEntity.findOne({where: { id: id }});

      user.status = Status.Banned;
      user.save();

      return {
        message: 'user.banned',
      };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async unBanUser(id: string) {
    try{
      const user = await UserEntity.findOne({where: { id: id }});

      user.status = Status.Inactive;
      user.save();

      return {
        message: 'user.unBanned',
      };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async updatePasswordLoggedIn(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      const { currentPassword, newPassword, verifyPassword } =
        updatePasswordDto;
      const user = await UserEntity.findOne({
        where: {
          id: id,
        },
      });

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!passwordMatches) {
        throw new HttpException(
          'Your current password is wrong!',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (newPassword !== verifyPassword) {
        throw new HttpException(
          'The confirmation password does not match the new password!',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (await bcrypt.compare(newPassword, user.password)) {
        throw new HttpException(
          'The new password must be different from the old one!',
          HttpStatus.BAD_REQUEST,
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return {
        message: 'password.changed',
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async resetPassword(
    resetForgottenPassword: ResetForgottenPasswordDto,
    ip: string,
  ) {
    try {
      const { otp, newPassword, verifyPassword } = resetForgottenPassword;

      console.log('otp');
      console.log(otp);

      const savedOtp = await OtpEntity.findOne({
        where: {
          otp: otp,
          action: Action.ChangeForgottenPassword,
        },
      });
      if (!savedOtp) {
        throw new HttpException('OTP invalid', HttpStatus.BAD_REQUEST);
        // return { message: 'wrong.otp' };
      }

      const user = await UserEntity.findOne({
        where: {
          id: savedOtp.user.id,
        },
      });

      // if otp expired resend it
      const expiredAt = new Date(new Date().getTime());
      const isExpired = savedOtp.expires_at < expiredAt;

      if (isExpired) {
        await savedOtp.remove();
        await this.sendEmailResetPassword(user.email, ip);
        throw new HttpException(
          'This OTP is expired. A new OTP has been sent.',
          HttpStatus.BAD_REQUEST,
        );
        // return { message: 'sent.newOtp' };
      }

      if (await bcrypt.compare(newPassword, user.password)) {
        throw new HttpException(
          'The new password must be different from the old one.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (newPassword !== verifyPassword) {
        throw new HttpException(
          'The two passwords do not match.',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      await savedOtp.remove();


      const otpForgottenPassword = await OtpEntity.find({
        where: {
          user: {id: user.id},
          action: Action.ChangeForgottenPassword,
        }
      })

      await Promise.all(
        otpForgottenPassword.map(async (otp: OtpEntity) => {
          await otp.remove();
        }),
      );

      return {
        message: 'password.reset',
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendEmailResetPassword(userIdentifier: string, ip: string) {
    try {
      const user = await UserEntity.findOne({
        where: [{ username: userIdentifier }, { email: userIdentifier }],
      });

      if (!user) {
        console.log('user does not exist');
        throw new NotFoundException('user not found');
      }

      const generatedOtp = await this.generateOtp(
        user.id,
        ip,
        Action.ChangeForgottenPassword,
      );

      // if otp existent resends the email
      if (Object.keys(generatedOtp).length !== 0) {
        const sendOtp = await this.mailService.sendOtpEmail(
          user.email,
          user.username,
          generatedOtp['otp'],
        );
        return {
          message: 'otp.sent',
        };
      }
      console.log('otp existent');
      console.log(generatedOtp['otp']);
      return {
        message: 'otp.existent',
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendOtpChangeEmail(id: string, ip: string) {
    try {
      const user = await UserEntity.findOne({ where: { id: id } });

      const generatedOtp = await this.generateOtp(id, ip, Action.ChangeEmail);

      const sendOtp = await this.mailService.sendOtpEmail(
        user.email,
        user.username,
        generatedOtp['otp'],
      );

      return {
        message: 'otp.sent',
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

  async changeEmail(id: string, changeEmail: ChangeEmailDto, ip: string) {
    try {
      const { email, otp } = changeEmail;

      const user = await UserEntity.findOne({ where: { id: id } });
      const savedOtp = await OtpEntity.findOne({
        where: {
          user: { id: user.id },
          otp: otp,
        },
      });
      if (!savedOtp) {
        throw new HttpException('OTP invalid!', HttpStatus.BAD_REQUEST);
      }
      // if otp expired resend it
      const expiredAt = new Date(new Date().getTime());
      const isExpired = savedOtp.expires_at < expiredAt;

      if (isExpired) {
        await savedOtp.remove();
        await this.sendOtpChangeEmail(id, ip);
        throw new HttpException(
          'otp expired sent new otp',
          HttpStatus.BAD_REQUEST,
        );

        // return { message: 'sent.newOtp' };
      }

      if (user.email == email) {
        throw new HttpException('Email identical', HttpStatus.BAD_REQUEST);
      }

      user.email = email;
      await user.save();
      await savedOtp.remove();

      await this.stripeService.updateCustomerEmail(user.id, user.email);

      return {
        message: 'email.saved',
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async generateOtp(id: string, ip: string, action: Action) {
    try {
      const min = 100000;
      const max = 999999;
      const code = Math.floor(Math.random() * (max - min + 1)) + min;
      const otp = code.toString();

      const date = new Date();
      const expiresDate = new Date(date.getTime() + expirationTime);

      let savedToken: any = {};

      const user = await UserEntity.findOne({
        where: {
          id: id,
        },
      });

      if (!user) {
        console.log('user does not exist');
        throw new NotFoundException('user notFound');
      }

      const twoFaToken = new OtpEntity();
      twoFaToken.user = user;
      twoFaToken.action = action;
      twoFaToken.expires_at = expiresDate;

      const existentOtp = await OtpEntity.findOne({
        where: {
          user: { id: user.id },
          action: action,
        },
      });

      if (existentOtp) {
        const expiredAt = new Date(new Date().getTime());
        const isExpired = existentOtp.expires_at < expiredAt;

        if (isExpired) {
          const expiredOtp = await OtpEntity.find({
            where: {
              user: {id: existentOtp.user.id},
              action: action,
            },
          });
          // remove all the entries of expired otp for ChangeEmail
          await Promise.all(
            expiredOtp.map(async (otp: OtpEntity) => {
              await otp.remove();
            }),
          );
          twoFaToken.otp = otp;
          savedToken = await twoFaToken.save();
          const { ...tokenData } = savedToken;
          console.log('expiredOtp');
          return tokenData;
        }
        console.log('existentOtp && !isExpired');
        // existentOtp - true but is not expired it does not save another otp
        const { ...tokenData } = existentOtp;
        return tokenData;
      }

      if (!existentOtp) {
        console.log('!existentOtp');
            twoFaToken.otp = otp;
        savedToken = await twoFaToken.save();
      }

      const { ...tokenData } = savedToken;
      return tokenData;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: string) {
    try{
      const user = await UserEntity.findOne({where: {id: id}})

      await this.stripeService.deleteCustomer(user.id);

      return await UserEntity.remove(user);
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async decodeToken(token: string) {
    try {
      return jwt.decode(token);
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
}
