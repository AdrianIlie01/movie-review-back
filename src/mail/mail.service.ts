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
                    }
                  .container {
                      width: 100%;
                      max-width: 600px;
                      margin: 50px auto;
                      background-color: #ffffff;
                      padding: 40px 30px;
                      border-radius: 10px;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    }
                    h2 {
                      color: #2e7d32;
                      margin-bottom: 20px;
                    }
                    p {
                      font-size: 16px;
                      color: #555555;
                      margin-bottom: 30px;
                    }
                  .otp {
                      display: inline-block;
                      font-size: 24px;
                      font-weight: bold;
                      color: #ffffff;
                      background-color: #4CAF50;
                      padding: 10px 20px;
                      border-radius: 6px;
                      letter-spacing: 2px;
                    }
                  .footer {
                      margin-top: 40px;
                      font-size: 12px;
                      color: #999999;
                    }
               </style>
            </head>
           <body style="margin:0; padding:0; background-color:#f4f4f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#444444;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-radius:12px; padding:40px 40px;">
          <tr>
            <td style="text-align:left; padding-bottom:24px;">
              <h1 style="margin:0; font-size:28px; color:#f5c518; font-weight:700;">Hello, ${sendOtpEmail.username}!</h1>
            </td>
          </tr>
          <tr>
            <td style="text-align:left; font-size:16px; line-height:1.5; padding-bottom:32px; color:#555555;">
              To continue, please use the following One-Time Password (OTP):
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f5c518; border-radius:8px; box-shadow: 0 3px 8px rgba(245,197,24,0.5);">
                <tr>
                  <td style="padding:14px 40px; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:3px; font-family: 'Courier New', Courier, monospace;">
                    ${sendOtpEmail.otp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align:left; font-size:16px; line-height:1.5; color:#555555; padding-bottom:24px;">
              This OTP is valid for a limited time. Please do not share it with anyone.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eaeaea; padding-top:24px; font-size:12px; color:#999999; text-align:left;">
              If you didn’t request this, you can safely ignore this email.
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px; font-size:12px; color:#bbbbbb; text-align:center;">
              &copy; ${new Date().getFullYear()} Movie Review. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

        </html>`
      });

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async sendOtpEmail(email: string, username: string, otp: string) {
    try {

      const emailSent = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: process.env.EMAIL_SUBJECT,
        html: `
         <html>
            <head>
                <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f9;
                    }
                  .container {
                      width: 100%;
                      max-width: 600px;
                      margin: 50px auto;
                      background-color: #ffffff;
                      padding: 40px 30px;
                      border-radius: 10px;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    }
                    h2 {
                      color: #2e7d32;
                      margin-bottom: 20px;
                    }
                    p {
                      font-size: 16px;
                      color: #555555;
                      margin-bottom: 30px;
                    }
                  .otp {
                      display: inline-block;
                      font-size: 24px;
                      font-weight: bold;
                      color: #ffffff;
                      background-color: #4CAF50;
                      padding: 10px 20px;
                      border-radius: 6px;
                      letter-spacing: 2px;
                    }
                  .footer {
                      margin-top: 40px;
                      font-size: 12px;
                      color: #999999;
                    }
               </style>
            </head>
           <body style="margin:0; padding:0; background-color:#f4f4f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#444444;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-radius:12px; padding:40px 40px;">
          <tr>
            <td style="text-align:left; padding-bottom:24px;">
              <h1 style="margin:0; font-size:28px; color:#f5c518; font-weight:700;">Hello, ${username}!</h1>
            </td>
          </tr>
          <tr>
            <td style="text-align:left; font-size:16px; line-height:1.5; padding-bottom:32px; color:#555555;">
              To continue, please use the following One-Time Password (OTP):
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f5c518; border-radius:8px; box-shadow: 0 3px 8px rgba(245,197,24,0.5);">
                <tr>
                  <td style="padding:14px 40px; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:3px; font-family: 'Courier New', Courier, monospace;">
                    ${otp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align:left; font-size:16px; line-height:1.5; color:#555555; padding-bottom:24px;">
              This OTP is valid for a limited time. Please do not share it with anyone.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eaeaea; padding-top:24px; font-size:12px; color:#999999; text-align:left;">
              If you didn’t request this, you can safely ignore this email.
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px; font-size:12px; color:#bbbbbb; text-align:center;">
              &copy; ${new Date().getFullYear()} Movie Review. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
        </html>`
      });
      return emailSent;
    } catch (e) {
      console.log(e.message);
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

}