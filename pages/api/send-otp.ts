import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import dbConnect from '@/utils/dbConnect';
import OTP from '@/models/OTP';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioServiceId = process.env.TWILIO_SERVICE_ID;

const client = twilio(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { phoneNumber } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.create({
      phoneNumber,
      otp,
    });

    // Send OTP via Twilio
    await client.verify.v2.services(twilioServiceId as string).verifications.create({
      to: `+${phoneNumber}`,
      channel: "sms",
      locale: "en",
      customCode: otp,
      sendDigits: otp,
    });

    res.status(200).json({ message: 'OTP sent successfully'});
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
} 