import webpush from 'web-push'

// Retrieve configuration directly from env
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || ''

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:admin@7staros.com',
    publicVapidKey,
    privateVapidKey
  )
} else {
  console.warn('WARNING: VAPID keys are missing. Web Push Notifications will fail.')
}

export default webpush
