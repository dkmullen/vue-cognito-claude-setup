<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { confirmSignUp, isConfigured, resendSignUpCode, signUp } from '@/stores/auth'
import { normalizeError } from '@/util/errors'

const router = useRouter()

const email = ref('')
const password = ref('')
const phone = ref('')
const code = ref('')

const awaitingCode = ref(false)
const error = ref('')
const info = ref('')
const loading = ref(false)

const emailRules = [(v) => !!v || 'Email is required']
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => (v?.length ?? 0) >= 8 || 'Use at least 8 characters',
]
// SMS MFA needs a phone number in E.164 format, e.g. +15551234567.
const phoneRules = [
  (v) => !!v || 'Phone number is required for two-step sign-in',
  (v) => /^\+[1-9]\d{7,14}$/.test(v) || 'Use international format, e.g. +15551234567',
]
const codeRules = [
  (v) => !!v || 'Enter the code we sent you',
  (v) => /^\d{6}$/.test(v) || 'Codes are 6 digits',
]

async function attempt(action) {
  error.value = ''
  info.value = ''
  loading.value = true
  try {
    await action()
  } catch (err) {
    error.value = normalizeError(err).message
  } finally {
    loading.value = false
  }
}

function submitSignUp() {
  return attempt(async () => {
    const { step } = await signUp({
      email: email.value.trim(),
      password: password.value,
      phone: phone.value.trim(),
    })
    if (step === 'CONFIRM_SIGN_UP') {
      awaitingCode.value = true
      info.value = 'We sent a confirmation code. Enter it below.'
    } else {
      router.replace({ name: 'login' })
    }
  })
}

function submitConfirm() {
  return attempt(async () => {
    await confirmSignUp(email.value.trim(), code.value.trim())
    router.replace({ name: 'login', query: { confirmed: '1' } })
  })
}

function resend() {
  return attempt(async () => {
    await resendSignUpCode(email.value.trim())
    info.value = 'A new code is on its way.'
  })
}
</script>

<template>
  <v-container class="fill-height" max-width="460">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12">
        <v-card class="pa-6" elevation="2">
          <v-card-title class="text-h5 px-0 mb-2">
            {{ awaitingCode ? 'Confirm your account' : 'Create an account' }}
          </v-card-title>

          <v-alert v-if="!isConfigured" type="warning" variant="tonal" class="mb-4">
            Cognito isn't configured yet. Add VITE_COGNITO_USER_POOL_ID and
            VITE_COGNITO_CLIENT_ID to your .env file, then restart the dev server.
          </v-alert>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">
            {{ error }}
          </v-alert>
          <v-alert v-if="info" type="info" variant="tonal" class="mb-4">
            {{ info }}
          </v-alert>

          <!-- Step 1: account details -->
          <v-form v-if="!awaitingCode" :disabled="!isConfigured || loading" @submit.prevent="submitSignUp">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="username"
              :rules="emailRules"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="new-password"
              hint="At least 8 characters"
              persistent-hint
              :rules="passwordRules"
              class="mb-4"
            />
            <v-text-field
              v-model="phone"
              label="Mobile phone"
              type="tel"
              autocomplete="tel"
              hint="Used to text you a code each time you sign in"
              persistent-hint
              :rules="phoneRules"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-4">
              Create account
            </v-btn>
            <div class="text-center mt-4">
              <router-link :to="{ name: 'login' }">Already have an account? Sign in</router-link>
            </div>
          </v-form>

          <!-- Step 2: confirm the emailed/texted code -->
          <v-form v-else :disabled="loading" @submit.prevent="submitConfirm">
            <v-text-field
              v-model="code"
              label="Confirmation code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              :rules="codeRules"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Confirm
            </v-btn>
            <div class="text-center mt-4">
              <v-btn variant="text" @click="resend">Resend code</v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
