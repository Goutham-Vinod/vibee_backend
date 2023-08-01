import twilio from "twilio"
import axios from "axios"

const client = twilio(
  process.env.TWILIO_ACCOUNTSID,
  process.env.TWILIO_AUTHTOKEN
)
export const sendOTP = async (phone) => {
  client.verify.v2
    .services(process.env.TWILIO_VERIFYSID)
    .verifications.create({ to: phone, channel: "sms" })
}

export const checkOTP = (phone, otp) => {
  console.log(phone, otp)
  let verified = false
  client.verify.v2
    .services(process.env.TWILIO_VERIFYSID)
    .verificationChecks.create({ to: phone, code: otp })
    .then((verification_check) => {
      console.log(verification_check.status)
      if (verification_check.status == "approved") {
        verified = true
      }
    })
}
export const checkOTPAsync = async (phone, otp) => {
  console.log(phone, otp)
  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_VERIFYSID)
    .verificationChecks.create({ to: phone, code: otp })
  console.log(verificationCheck.status)
  if (verificationCheck.status === "approved") {
    return true
  }
  return false
}
