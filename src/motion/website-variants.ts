// ─────────────────────────────────────────────
// WEBSITE-ONLY VARIANTS
// Import these ONLY in mvp-website-engine
// NEVER import in dashboard repos
// Heavy, cinematic, expressive
// ─────────────────────────────────────────────

export const heroReveal = {
  initial:    { opacity: 0, y: 48 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
}

export const heroStagger = {
  container: {
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  },
  item: {
    initial:    { opacity: 0, y: 40 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
}

export const fadeUpLarge = {
  initial:    { opacity: 0, y: 64 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
}

export const scaleReveal = {
  initial:    { opacity: 0, scale: 0.88 },
  animate:    { opacity: 1, scale: 1 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
}

export const sectionReveal = {
  initial:    { opacity: 0, y: 32 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
}

export const featureCardHover = {
  whileHover: { y: -8, boxShadow: '0 24px 48px rgba(0,0,0,0.2)' },
  transition: { duration: 0.3 }
}

export const pageTransitionWebsite = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4 }
}
