import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const sesClient = new SESv2Client({
  credentials: {
    accessKeyId: process.env.SES_KEY,
    secretAccessKey: process.env.SES_SECRET,
  },
  region: process.env.SES_REGION,
});

async function sendEmail(to_email: string, subject: string, body: string) {
  const senderEmail = `WellRead <hello@wellread.com>`;
  const params = {
    Source: senderEmail,
    Destination: {
      ToAddresses: [to_email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: body,
          },
        },
      },
    }
  };
  const command = new SendEmailCommand(params);
  await sesClient.send(command);
}

export { sendEmail };
