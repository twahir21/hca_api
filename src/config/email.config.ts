import { Resend } from 'resend';

const resend = new Resend('RESEND_API_TOKEN');

export const sendEmail = (from: string, to: string, subject: string, html: string) => {
    resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
}