import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import OTP from "@/models/OTP";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { phoneNumber, otp } = req.body;

    // Find the OTP document
    const otpDoc = await OTP.findOne({
      phoneNumber,
      otp,
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Delete the OTP document
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
}
