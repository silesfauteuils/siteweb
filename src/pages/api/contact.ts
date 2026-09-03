import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const POST = async ({ request }: { request: Request }) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  try {
    const formData = await request.formData()

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
