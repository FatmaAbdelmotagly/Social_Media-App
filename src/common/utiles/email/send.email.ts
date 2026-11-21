import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from "../../../config.js";
import {BadRequstException} from '../../../common/exception/domain.exception'
import { EmailSubjectEnum } from "../../enum/email.enum.js";
export const UserEmailKey = ({ email, subject }:{email : string , subject : EmailSubjectEnum}) => {
  return `User::${email}::${subject}::OTP`;
};
export const UserEmailTrialsKey = ({ email , subject }:{email :  string , subject : EmailSubjectEnum}) => {
  return `User::${UserEmailKey({email, subject})}::Trials`;
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  cc,
  bcc,
  text,
  html,
  attachments,
}:{
  to: string[],
  subject:EmailSubjectEnum ,
  cc?: string[],
  bcc?: string[],
  text?: string,
  html: any ,
  attachments?:any[]

}) => {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw new BadRequstException("missing email recipients");
    }
    if (text?.length && html?.length && attachments?.length) {
      throw new BadRequstException("missing email content ");
    }
    const info = await transporter.sendMail({
      from: ` "${APPLICATION_NAME}" <${APP_EMAIL}> `,
      to,
      subject,
      cc,
      bcc,
      text,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
