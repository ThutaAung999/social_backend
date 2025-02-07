/* eslint-disable no-undef */
//above comment is user for process.env.USER and process.env.PASS
import nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
