// Shared across all repos via import

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 }
}

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: "easeOut" }
}

export const slideInRight = {
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 48 },
  transition: { duration: 0.3, ease: "easeOut" }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -48 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -48 },
  transition: { duration: 0.3, ease: "easeOut" }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: "easeOut" }
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0 },
  transition: { duration: 0.25, ease: 'easeOut' }
}

// ─────────────────────────────────────────────
// DASHBOARD-SAFE VARIANTS
// These are the ONLY variants used in dashboard repos
// Fast, subtle, professional
// ─────────────────────────────────────────────

export const pageEnter = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.22, ease: 'easeOut' }
}

export const modalEnter = {
  initial:    { opacity: 0, scale: 0.96 },
  animate:    { opacity: 1, scale: 1 },
  exit:       { opacity: 0, scale: 0.96 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
}

export const slideFromRight = {
  initial:    { opacity: 0, x: 32 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: 32 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
}

export const cardStagger = {
  container: {
    initial: {},
    animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
  },
  item: {
    initial:    { opacity: 0, y: 12 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
  }
}

export const sidebarVariants = {
  open:   { width: 260, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  closed: { width: 72,  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
}

export const listItemHover = {
  whileHover: { backgroundColor: 'var(--bg-subtle)', x: 2 },
  transition: { duration: 0.15 }
}

export const buttonPress = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 }
}

export const tableRowHover = {
  whileHover: { backgroundColor: 'var(--bg-subtle)' },
  transition: { duration: 0.12 }
}

// CountUp component — used in StatsCards
// Import CountUp from '@/components/motion/CountUp'
