import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

const isNameValid = (value) => {
  const name = value?.trim()
  if (!name?.length > 0) {
    return false
  }
  return true
}

const isEmailValid = (value) => {
  const email = value?.trim()
  if (!email?.length) {
    return false
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return false
  }
  return true
}

const isPhoneValid = (value) => {
  const phone = value?.trim()
  if (!phone?.length) {
    return false
  }
  if (!/^([0|\+[0-9]{1,5})?([6-9][0-9]{9})$/gm.test(phone)) {
    return false
  }
  return true
}

export const isUsernameValid = (value) => {
  const username = value?.trim()
  if (!username?.length > 3) {
    return false
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return false
  }
  return true
}

const isPasswordValid = (value) => {
  const password = value?.trim()
  if (!password?.length) {
    return false
  }
  return true
}

const isMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return false
  }
  return true
}

const isLocationValid = (value) => {
  const location = value?.trim()
  if (!location.length) {
    return false
  }
  return true
}

const isGenderValid = (value) => {
  const gender = value.trim()
  if (gender !== "male" && gender !== "female" && gender !== "others") {
    return false
  }
  return true
}

const isDateValid = (value) => {
  console.log(value)
  const date = value.trim()
  if (!date.length) {
    return false
  }
  return true
}

export const validateRegister = (user) => {
  const errors = {}
  if (!isNameValid(user.firstName)) {
    errors.firstName = "Please enter a valid first name"
  }
  if (!isNameValid(user.lastName)) {
    errors.lastName = "Please enter a valid last name"
  }
  if (!isUsernameValid(user.username)) {
    errors.username = "Please enter a valid last name"
  }
  if (!isEmailValid(user.email)) {
    errors.email = "Please enter a valid email"
  }
  if (!isPhoneValid(user.phone)) {
    errors.phone = "Please enter a valid phone"
  }
  if (!isPasswordValid(user.password)) {
    errors.password = "Please enter a valid password"
  }
  if (!isPasswordValid(user.confirmPassword)) {
    errors.confirmPassword = "Please enter a valid password"
  } else if (!isMatch(user.password, user.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match"
  }
  const isValid = !Object.keys(errors).length
  return {
    isValid,
    errors,
  }
}

export const createToken = (id, email) => {
  const user = { id, email }
  const token = jwt.sign({ user }, process.env.TOKEN_SECRET_KEY)
  return token
}

export const checkDetails = (details) => {
  const errors = {}
  if (!isUsernameValid(details.username)) {
    errors.username = "Please enter a valid username"
  }
  if (!isLocationValid(details.location)) {
    errors.location = "Please enter a valid location"
  }
  if (!isGenderValid(details.gender)) {
    errors.gender = "Please enter a valid gender"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const validateLoginUser = (details) => {
  const errors = {}
  if (!isEmailValid(details.email)) {
    errors.email = "Please enter a valid email"
  }
  if (!isPasswordValid(details.password)) {
    errors.password = "Please enter a valid password"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const validateUpdatedDetails = (user) => {
  const errors = {}
  if (!isNameValid(user.firstName)) {
    errors.firstName = "Please enter a valid first name"
  }
  if (!isNameValid(user.lastName)) {
    errors.lastName = "Please enter a valid last name"
  }
  if (!isUsernameValid(user.username)) {
    errors.username = "Please enter a valid last name"
  }
  if (!isDateValid(user.date)) {
    errors.dob = "Please enter a valid date"
  }
  if (!isEmailValid(user.email)) {
    errors.email = "Please enter a valid email"
  }

  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}

export const sendMail = async (mail, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    })
    let detail = {
      from: process.env.NODEMAILER_EMAIL,
      to: mail,
      subject: "VIBEE OTP",
      text: `Your OTP for resetting password is ${otp}`,
    }
    console.log("sending")
    let info = await transporter.sendMail(detail)
    console.log("Message sent: %s", info.messageId)
    return info
  } catch (error) {
    throw error
  }
}

export const validatePassword = (user) => {
  const errors = {}
  if (!isPasswordValid(user.password)) {
    errors.password = "Please enter a valid password"
  }
  if (!isPasswordValid(user.confirmPassword)) {
    errors.confirmPassword = "Please enter a valid password"
  } else if (!isMatch(user.password, user.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match"
  }
  const isValid = !Object.keys(errors).length
  return { isValid, errors }
}
