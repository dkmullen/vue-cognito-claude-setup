import { Amplify } from 'aws-amplify'
import {
  confirmSignIn,
  confirmSignUp as amplifyConfirmSignUp,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  resendSignUpCode as amplifyResendSignUpCode,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
} from 'aws-amplify/auth'
import { ApiError } from '@/util/errors'

/**
 * The ONLY file in the app that knows about AWS Cognito / Amplify.
 *
 * Everything else talks to src/stores/auth.js, which uses the provider-neutral
 * step names exported here (STEP) instead of Amplify's raw strings.
 *
 * Config comes from .env (see .env.example). The region is derived from the
 * user pool ID by Amplify, so it doesn't need its own variable.
 */

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID

export const isConfigured = Boolean(userPoolId && userPoolClientId)

if (isConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: { email: true },
      },
    },
  })
}

/** Provider-neutral step names returned to the rest of the app. */
export const STEP = Object.freeze({
  DONE: 'DONE',
  SMS_CODE: 'SMS_CODE',
  NEW_PASSWORD: 'NEW_PASSWORD',
  MFA_SETUP: 'MFA_SETUP',
  CONFIRM_SIGN_UP: 'CONFIRM_SIGN_UP',
})

const SIGN_IN_STEPS = {
  DONE: STEP.DONE,
  CONFIRM_SIGN_IN_WITH_SMS_CODE: STEP.SMS_CODE,
  CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED: STEP.NEW_PASSWORD,
  CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION: STEP.MFA_SETUP,
  CONTINUE_SIGN_IN_WITH_TOTP_SETUP: STEP.MFA_SETUP,
  CONTINUE_SIGN_IN_WITH_EMAIL_SETUP: STEP.MFA_SETUP,
  CONTINUE_SIGN_IN_WITH_SMS_SETUP: STEP.MFA_SETUP,
}

/** Cognito error names -> messages safe to show users. */
const ERROR_MESSAGES = {
  NotAuthorizedException: 'Incorrect email or password.',
  UserNotFoundException: 'Incorrect email or password.',
  UserNotConfirmedException: 'Please confirm your account before signing in.',
  CodeMismatchException: 'That code is incorrect. Please try again.',
  ExpiredCodeException: 'That code has expired. Request a new one.',
  UsernameExistsException: 'An account with this email already exists.',
  InvalidPasswordException: 'Password does not meet the requirements.',
  InvalidParameterException: 'Please check the information you entered.',
  LimitExceededException: 'Too many attempts. Please wait and try again.',
  TooManyRequestsException: 'Too many attempts. Please wait and try again.',
}

function toApiError(err) {
  if (err instanceof ApiError) return err
  return new ApiError({
    message: ERROR_MESSAGES[err?.name] ?? err?.message ?? 'Something went wrong.',
    code: err?.name ?? null,
    cause: err,
  })
}

async function run(fn) {
  if (!isConfigured) {
    throw new ApiError({
      message:
        'Cognito is not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in .env.',
      code: 'NOT_CONFIGURED',
    })
  }
  try {
    return await fn()
  } catch (err) {
    throw toApiError(err)
  }
}

function signInResult(result) {
  const raw = result?.nextStep?.signInStep ?? 'DONE'
  return { step: SIGN_IN_STEPS[raw] ?? raw }
}

/** Sign in with email + password. Returns { step } (see STEP). */
export function signIn({ username, password }) {
  return run(async () => signInResult(await amplifySignIn({ username, password })))
}

/** Answer the SMS MFA challenge (or any challenge expecting a code). */
export function confirmSignInCode(code) {
  return run(async () =>
    signInResult(await confirmSignIn({ challengeResponse: code })),
  )
}

/** Answer the "new password required" challenge. */
export function completeNewPassword(newPassword) {
  return run(async () =>
    signInResult(await confirmSignIn({ challengeResponse: newPassword })),
  )
}

/** Create an account. Phone number (E.164) is needed for SMS MFA. */
export function signUp({ email, password, phone }) {
  return run(async () => {
    const result = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: { email, phone_number: phone },
      },
    })
    const raw = result?.nextStep?.signUpStep
    return { step: raw === 'CONFIRM_SIGN_UP' ? STEP.CONFIRM_SIGN_UP : STEP.DONE }
  })
}

export function confirmSignUp({ email, code }) {
  return run(() =>
    amplifyConfirmSignUp({ username: email, confirmationCode: code }),
  )
}

export function resendSignUpCode(email) {
  return run(() => amplifyResendSignUpCode({ username: email }))
}

export function signOut() {
  return run(() => amplifySignOut())
}

/** Returns { username, email } for the signed-in user, or null. Never throws. */
export async function getCurrentUser() {
  if (!isConfigured) return null
  try {
    const user = await amplifyGetCurrentUser()
    return {
      username: user.username,
      email: user.signInDetails?.loginId ?? user.username,
    }
  } catch {
    return null
  }
}

/**
 * Current ID token (JWT) for the Authorization header. Amplify refreshes it
 * automatically when it has expired. Returns null when signed out. Never throws.
 */
export async function getIdToken() {
  if (!isConfigured) return null
  try {
    const { tokens } = await fetchAuthSession()
    return tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}
