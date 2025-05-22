import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as process from "process";
import { SendOtpEmail } from "./dto/send-otp-email";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
      port:  process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user:  process.env.EMAIL_USERNAME,
        pass:  process.env.EMAIL_PASSWORD,
      },
    });

  }
  async sendMail(sendOtpEmail: SendOtpEmail): Promise<void> {
    try {

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: sendOtpEmail.email,
        subject: process.env.EMAIL_SUBJECT,
        // text: `Hi ${sendOtpEmail.username} your OTP is ${sendOtpEmail.otp}`,
        html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f9;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .container {
                width: 100%;
                max-width: 600px;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              h1 {
                color: #4CAF50;
              }
              p {
                font-size: 16px;
                color: #333;
                line-height: 1.6;
              }
              .cta-button {
                display: inline-block;
                background-color: #4CAF50;
                color: #fff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
<!--              <h1>Salut, ${sendOtpEmail.username}!</h1>-->
              
                 <p>Hi ${sendOtpEmail.username} your OTP is ${sendOtpEmail.otp}</p>

            </div>
          </body>
        </html>`,
        // attachments: [
        //   {
        //     filename: 'imagine.png',      // numele fișierului atașat
        //     path: `${videoPath}/imagine.png`
        //   }
        // ],
      });

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async sendOtpEmail(email: string, username: string, otp: string) {
    try {

      const emailSent = await this.transporter.sendMail({
        to: email,
        subject: 'Cod verificare OTP',
        template: './sentOtp',
        context: {
          name: username,
          otp: otp,
        },
      });
      console.log('email sent');
      console.log(emailSent);
      return emailSent;
    } catch (e) {
      console.log(e.message);
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

}