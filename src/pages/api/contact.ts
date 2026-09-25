import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)

// Simple in-memory rate limit (per serverless instance).
// For stronger global limiting behind Vercel, use Vercel KV / Upstash later.
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5 // max submissions
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // per 10 min
const MIN_SUBMIT_DELAY_MS = 3000 // humans take >3s to fill the form

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const POST = async ({ request }: { request: Request }) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  try {
    // Rate limit before parsing heavy payloads (files)
    const clientIp = getClientIp(request)
    if (isRateLimited(clientIp)) {
      return jsonError('Trop de tentatives. Veuillez réessayer dans quelques minutes.', 429)
    }

    const formData = await request.formData()

    // 1. Honeypot : les bots remplissent ce champ invisible aux humains.
    // Répondre "ok" pour ne pas révéler la détection au bot.
    const honeypot = formData.get('website')?.toString() || ''
    if (honeypot) {
      console.warn(`[contact] spam bloqué (honeypot) depuis IP ${clientIp}`)
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. Time trap : soumission trop rapide = bot
    const startedAt = Number(formData.get('form_started_at'))
    if (!startedAt || Number.isNaN(startedAt)) {
      return jsonError('Session de formulaire invalide. Veuillez recharger la page.', 400)
    }
    if (Date.now() - startedAt < MIN_SUBMIT_DELAY_MS) {
      console.warn(`[contact] spam bloqué (time-trap) depuis IP ${clientIp}`)
      return jsonError('Envoi trop rapide. Veuillez réessayer.', 400)
    }

    const nom = formData.get('nom')?.toString() || ''
    const prenom = formData.get('prenom')?.toString() || ''
    const telephone = formData.get('telephone')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const ville = formData.get('ville')?.toString() || ''
    const message = formData.get('message')?.toString() || ''
    const pieceJointes = formData.getAll('piece-jointe').filter((f): f is File => f instanceof File && !!f.name)

    const errors: string[] = []
    if (!nom) errors.push('Nom est requis')
    if (!prenom) errors.push('Prénom est requis')
    if (!email) {
      errors.push('Email est requis')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email n\'est pas valide')
    }
    if (!message) errors.push('Message est requis')
    if (message.length > 5000) errors.push('Message trop long (max 5000 caractères)')
    if (nom.length > 100) errors.push('Nom trop long')
    if (email.length > 254) errors.push('Email trop long')

    // 3. Anti-liens spam : la plupart des spams contiennent plusieurs URLs
    const urlCount = (message.match(/https?:\/\/|www\./gi) || []).length
    if (urlCount > 3) errors.push('Les messages contenant trop de liens ne sont pas acceptés')

    if (errors.length > 0) {
      return new Response(JSON.stringify({ ok: false, error: errors.join(', ') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const ownerEmail = import.meta.env.OWNER_EMAIL
    const siteUrl = import.meta.env.SITE_URL

    if (!ownerEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'OWNER_EMAIL n\'est pas configuré' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const attachments: { filename: string; content: Buffer }[] = []
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = ['image/', 'application/pdf']

    for (const pieceJointe of pieceJointes) {
      if (pieceJointe.size > maxSize) {
        return new Response(JSON.stringify({ ok: false, error: `La pièce jointe "${pieceJointe.name}" ne doit pas dépasser 10 Mo` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const isAllowed = allowedTypes.some(type => pieceJointe.type.startsWith(type))
      if (!isAllowed) {
        return new Response(JSON.stringify({ ok: false, error: `Format de fichier non autorisé : "${pieceJointe.name}". Utilisez image ou PDF.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const arrayBuffer = await pieceJointe.arrayBuffer()
      attachments.push({
        filename: pieceJointe.name,
        content: Buffer.from(arrayBuffer)
      })
    }

    const emailBody = `
Nouvelle demande de devis

Nom: ${nom}
Prénom: ${prenom}
Téléphone: ${telephone || 'Non renseigné'}
Email: ${email}
Ville de résidence: ${ville || 'Non renseignée'}

Message:
${message}

---
Site: ${siteUrl || 'Non renseigné'}
    `.trim()

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [ownerEmail],
      replyTo: email,
      subject: `Nouvelle demande de devis – ${nom} ${prenom}`,
      text: emailBody,
      attachments: attachments.length > 0 ? attachments : undefined
    })

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur inconnue'
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
