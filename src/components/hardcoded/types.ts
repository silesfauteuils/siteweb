export interface ContentImage {
  src: string
  alt: string
}

export interface ContentButton {
  text: string
  href: string
  variant?: 'primary' | 'secondary'
}

export interface ContentIcon {
  src: string
  alt: string
}

export interface ContentAnimation {
  target?: string
  trigger?: string
  type: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'staggerFadeIn' | 'parallax'
  duration?: number
  start?: string
}
