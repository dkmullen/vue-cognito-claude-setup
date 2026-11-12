<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  authState,
  cancelChallenge,
  completeNewPassword,
  confirmSignInCode,
  isAuthenticated,
  isConfigured,
  signIn,
} from '@/stores/auth'
import { normalizeError } from '@/util/errors'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const code = ref('')
const newPassword = ref('')

const error = ref('')
const loading = ref(false)

const step = computed(() => authState.step)
const redirectTo = computed(() => route.query.redirect || '/')

const emailRules = [(v) => !!v || 'Email is required']
const requiredRule = (label) => (v) => !!v || `${label} is required`
const codeRules = [
  (v) => !!v || 'Enter the code we sent you',
  (v) => /^\d{6}$/.test(v) || 'Codes are 6 digits',
]

async function attempt(action) {
  error.value = ''
  loading.value = true
  try {
    await action()
    if (isAuthenticated.value) {
      router.replace(redirectTo.value)
    }
  } catch (err) {
    error.value = normalizeError(err).message
  } finally {
    loading.value = false
  }
}

function submitCredentials() {
  return attempt(() => signIn(email.value.trim(), password.value))
}

function submitCode() {
  return attempt(() => confirmSignInCode(code.value.trim()))
}

function submitNewPassword() {
  return attempt(() => completeNewPassword(newPassword.value))
}

function startOver() {
  cancelChallenge()
  code.value = ''
  newPassword.value = ''
  error.value = ''
}
</script>

<template>
  <v-container class="fill-height" max-width="460">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12">
        <v-card class="pa-6" elevation="2">
          <v-card-title class="text-h5 px-0 mb-2">Sign in</v-card-title>

          <v-alert
            v-if="route.query.confirmed"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            Your account is confirmed. Sign in to continue.
          </v-alert>

          <v-alert
            v-if="!isConfigured"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Cognito isn't configured yet. Add VITE_COGNITO_USER_POOL_ID and
            VITE_COGNITO_CLIENT_ID to your .env file, then restart the dev server.
          </v-alert>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            role="alert"
          >
            {{ error }}
          </v-alert>

          <!-- Step 1: email + password -->
          <v-form v-if="!step" :disabled="!isConfigured || loading" @submit.prevent="submitCredentials">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="username"
              :rules="emailRules"
              class="mb-2"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="current-password"
              :rules="[requiredRule('Password')]"
            />
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
            >
              Continue
            </v-btn>
            <div class="text-center mt-4">
              <router-link :to="{ name: 'signup' }">Create an account</router-link>
            </div>
          </v-form>

          <!-- Step 2: SMS MFA code -->
          <v-form v-else-if="step === 'SMS_CODE'" :disabled="loading" @submit.prevent="submitCode">
            <p class="text-body-2 mb-4">
              We texted a 6-digit code to your phone. Enter it below to finish signing in.
            </p>
            <v-text-field
              v-model="code"
              label="Verification code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              :rules="codeRules"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Verify
            </v-btn>
            <div class="text-center mt-4">
              <v-btn variant="text" @click="startOver">Start over</v-btn>
            </div>
          </v-form>

          <!-- Step 3: Cognito requires a permanent password -->
          <v-form v-else-if="step === 'NEW_PASSWORD'" :disabled="loading" @submit.prevent="submitNewPassword">
            <p class="text-body-2 mb-4">
              Your account needs a new password before you can continue.
            </p>
            <v-text-field
              v-model="newPassword"
              label="New password"
              type="password"
              autocomplete="new-password"
              :rules="[requiredRule('New password')]"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Set password
            </v-btn>
            <div class="text-center mt-4">
              <v-btn variant="text" @click="startOver">Start over</v-btn>
            </div>
          </v-form>

          <!-- MFA enrolment is not supported by this app yet -->
          <div v-else-if="step === 'MFA_SETUP'">
            <p class="text-body-2 mb-4">
              This account must finish multi-factor setup, which this app doesn't
              support yet. Contact an administrator.
            </p>
            <v-btn variant="text" @click="startOver">Back</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
