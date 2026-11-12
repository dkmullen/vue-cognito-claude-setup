import { computed, reactive, readonly } from 'vue'
import * as cognito from '@/lib/cognito'

/**
 * App-wide auth state. A plain reactive singleton (no Pinia needed).
 *
 * Components and the router use this module, never src/lib/cognito.js directly,
 * so the provider could be swapped without touching the UI.
 *
 * `step` is non-null while a sign-in challenge is pending, e.g. 'SMS_CODE'
 * or 'NEW_PASSWORD' (values from cognito.STEP).
 */
const state = reactive({
  user: null, // { username, email } when signed in
  ready: false, // true once init() has checked for an existing session
  step: null, // pending sign-in challenge, if any
})

export const authState = readonly(state)
export const isAuthenticated = computed(() => state.user !== null)
export const isConfigured = cognito.isConfigured

/** Restore an existing session on app start. Call once before mounting. */
export async function init() {
  state.user = await cognito.getCurrentUser()
  state.ready = true
}

/** Applies a step result: either completes sign-in or records the pending challenge. */
async function applySignInResult({ step }) {
  if (step === cognito.STEP.DONE) {
    state.user = await cognito.getCurrentUser()
    state.step = null
  } else {
    state.step = step
  }
  return step
}

export function signIn(email, password) {
  return cognito
    .signIn({ username: email, password })
    .then(applySignInResult)
}

export function confirmSignInCode(code) {
  return cognito.confirmSignInCode(code).then(applySignInResult)
}

export function completeNewPassword(newPassword) {
  return cognito.completeNewPassword(newPassword).then(applySignInResult)
}

/** Abandon a pending challenge so the user can start over. */
export function cancelChallenge() {
  state.step = null
}

export function signUp({ email, password, phone }) {
  return cognito.signUp({ email, password, phone })
}

export function confirmSignUp(email, code) {
  return cognito.confirmSignUp({ email, code })
}

export function resendSignUpCode(email) {
  return cognito.resendSignUpCode(email)
}

export async function signOut() {
  try {
    await cognito.signOut()
  } finally {
    // Clear local state even if the provider call failed, so the UI and
    // route guard agree that the user is signed out.
    state.user = null
    state.step = null
  }
}

/** Provider-neutral token getter for the HTTP client. */
export const getIdToken = () => cognito.getIdToken()
