import { EventEmitter } from "events";
import { sendEmail } from "./send.email.js";
import { verifyEmailTemplate } from "./email.templete.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";
export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ data, recipients }:{data:any , recipients : {to:string[] ,cc?:string[], bcc?:string[]}}) => {
  await sendEmail({
    ...recipients ,
    subject: data.subject as EmailSubjectEnum,
    html: verifyEmailTemplate(data),
  });
});
