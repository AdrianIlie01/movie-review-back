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
            <body>
              <div class="container">
                <h2>Hello, ${sendOtpEmail.username}!</h2>
              <p>To continue, please use the following One-Time Password (OTP):</p>
              <div class="otp">${sendOtpEmail.otp}</div>
                <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
              <div class="footer">
                If you didn’t request this, you can safely ignore this email.
              </div>
              </div>
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
            <body>
              <div class="container">
                <h2>Hello, ${username}!</h2>
              <p>To continue, please use the following One-Time Password (OTP):</p>
              <div class="otp">${otp}</div>
                <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
              <div class="footer">
                If you didn’t request this, you can safely ignore this email.
              </div>
              </div>
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