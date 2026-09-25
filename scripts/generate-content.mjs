#!/usr/bin/env node

/**
 * Generates storyblok-content.json from structured JS helpers.
 * Run: node scripts/generate-content.mjs
 */

import { writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Rich text helpers ────────────────────────────────────────────────────────

function doc(...blocks) {
  return { type: "doc", content: blocks }
}

function p(text) {
  return { type: "paragraph", content: [{ type: "text", text }] }
}

function bulletList(...items) {
  return {
    type: "bullet_list",
    content: items.map((text) => ({
      type: "list_item",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    })),
  }
}

// ── Asset helpers ────────────────────────────────────────────────────────────

function asset(filename, alt = "") {
  return { filename, alt }
}

function link(url) {
  if (url.startsWith("http")) {
    return { linktype: "url", url, fieldtype: "multilink" }
  }
  const slug = url.startsWith("/") ? url.slice(1) : url
  return { linktype: "story", id: "", url: "", cached_url: slug, fieldtype: "multilink" }
}

function route(url) {
  return url
}

// ── Content ──────────────────────────────────────────────────────────────────

const content = {
  // Site-wide configuration (never rendered as a page).
  // The `images` array feeds the labels banner above the footer —
  // editors can add/remove label logos directly in Storyblok.
  global: {
    component: "global",
    images: [
      {
        filename: "https://a.storyblok.com/f/295373470112198/305x240/0c51e973d0/artisan.png",
        alt: "Logo Artisan — décret du 2 avril 1998",
      },
    ],
  },
  home: {
    component: "page",
    title: "Tapissier d'ameublement Roquettes (Toulouse, 31)",
    description:
      "Atelier de tapisserie à Roquettes (Haute-Garonne, 31) | Restauration de fauteuils, canapés, chaises | Enlèvement & Livraison | Estimation gratuite sur photos",
    robots: "all",
    body: [
      {
        component: "hero",
        badge: "Artisanat durable - CAP Tapissier d'ameublement - Proximité géographique",
        heading:
          "Tapissier d'ameublement à Roquettes, près de Toulouse (Haute-Garonne, 31)",
        subtitle: "Si les fauteuils parlaient, tapissier d'ameublement",
        info: doc(
          p("8 Rue du Moulin, 31120 Roquettes"),
          p("06 50 72 78 43"),
          p("Ouvert du Lundi au Samedi, sur rendez-vous"),
          p("Enlèvement & livraison à domicile (gratuit jusqu'à 20 km autour de Roquettes)"),
          p("Travaux réalisés entre 2 jours et 3 semaines")
        ),
        primary_button_text: "Devis gratuit",
        primary_button_link: link("/contact"),
        secondary_button_text: "Venir à l'atelier",
        secondary_button_link: "https://maps.app.goo.gl/f5RHbZSMcBUAXRCF6",
        image: asset("/images/hero1.JPG", "Luxury residential tower with panoramic city views at dusk"),
      },
      {
        component: "features",
        subtitle: "",
        heading: "Restauration de fauteuils, chaises, canapés et assises autour de Toulouse",
        image: asset("/images/hero2.JPG", "Floor-to-ceiling windows overlooking the city skyline"),
        body: doc(
          p("Rénover un fauteuil, ce n'est pas seulement changer un tissu. C'est redonner vie à une pièce riche de souvenirs, et lui offrir un avenir. Retrouver une présence, un confort, une allure, tout en respectant ce qui fait la valeur du siège : sa ligne, son usage, son histoire et sa place dans votre intérieur."),
          p("Artisan et tapissier décorateur à 30 minutes de Toulouse, j'aborde chaque projet de restauration ou de réfection avec exigence, sens du détail et regard décoratif. Selon votre besoin, je propose la reprise du garnissage, le remplacement du tissu, l'amélioration du confort, la réparation de l'assise, les finitions cloutées ou galonnées, et le rééquilibrage esthétique de la pièce."),
          bulletList(
            "Premier avis sur photo",
            "Accompagnement dans le choix des tissus",
            "Rénovation soignée à l'atelier de Roquettes (31)"
          )
        ),
      },
      {
        component: "stats",
        title: "Quelles pièces me confier ?",
        services: [
          { component: "stat_service", text: doc(p("La restauration de vos fauteuils anciens, vintage ou contemporains.")) },
          { component: "stat_service", text: doc(p("La rénovation de vos canapés en cuir ou en tissu (réparation et rembourrage des canapés, des coussins d'assises et de dossier).")) },
          { component: "stat_service", text: doc(p("Le choix des tissus et la tapisserie de vos fauteuils et chaises.")) },
          { component: "stat_service", text: doc(p("Le relooking de vos chaises en bois, cannées et rustiques.")) },
          { component: "stat_service", text: doc(p("La réparation de chaises usées ou affaissées.")) },
          { component: "stat_service", text: doc(p("Des projets de sellerie légère (banquettes outdoor et caravaning, salles d'attente…).")) },
          { component: "stat_service", text: doc(p("Des travaux de coutures et petites réparations (fermetures éclairs, accoudoirs, coussins…).")) },
        ],
      },
      {
        component: "gallery",
        heading: "Galerie",
        items: [
          { component: "gallery_item", image: asset("/images/voltaire.jpg", "Canapé Voltaire avec assise et dossier restaurés"), caption: "Voltaire" },
          { component: "gallery_item", image: asset("/images/img2.jpg", "Fauteuil en cuir avec détail de la tapisserie"), caption: "Fauteuil" },
          { component: "gallery_item", image: asset("/images/img3.JPG", "Chaise en bois avec assise restaurée"), caption: "Chaise" },
          { component: "gallery_item", image: asset("/images/rockabilly.JPG", "Fauteuil scandinave avec assise et dossier rénovés"), caption: "Fauteuil scandinave" },
        ],
      },
      {
        component: "cta",
        headline: "Un atelier de tapisserie autour de vous (31, Haute-Garonne)",
        text: doc(
          p("Mon atelier de tapisserie est idéalement situé pour les particuliers vivant à Roquettes, Toulouse, Muret, Portet-sur-Garonne, Cugnaux, Villeneuve-Tolosane, Frouzins, Seysses, Roques, Pins-Justaret, Pinsaguel et dans les communes voisines.")
        ),
        button_text: "Demander un devis gratuit",
        button_link: route("/contact"),
      },
      {
        component: "showcase",
        title: "Réfection d'un canapé de style et nettoyage de deux fauteuils bergères en 10 jours",
        tagline: "",
        testimonial_quote:
          "Céline Blin est une personne délicate et professionnelle, nous sommes enchantées de son travail, et ces prix sont tout à fait corrects. N'hésitez pas à lui confier une restauration, ce sera bien fait et dans de bonnes conditions.",
        testimonial_author_name: "Nathalie Barriac",
        testimonial_author_company: "",
        body: doc(
          p("Mme Barriac nous a confié la réfection complète d'un canapé de style. Pour répondre à son besoin de fermeté, nous avons remplacé l'ancien garnissage par des mousses neuves Haute Résilience (HR), parfaitement adaptées au confort demandé. Côté esthétique, l'assise, le dossier ainsi que les joues intérieures des accoudoirs arborent désormais un nouveau tissu. Par souci d'harmonie, nous avons conservé un passepoil aux couleurs d'origine, et souligné les accotoirs d'une finition cloutée. Nous avons également nettoyé ses deux fauteuils bergères assortis. Grâce à ce travail d'harmonisation, notre cliente profite désormais d'un salon unique, esthétique et confortable ! Projet réalisé à 4 mains - Délai : 10 jours")
        ),
        before_image: asset("/images/barriacold.png", "Fauteuil avant restauration"),
      },
      {
        component: "philosophy",
        title: "Ma philosophie",
        tagline: "Révéler l'âme de vos assises",
        intro: doc(
          p("Vous n'avez pas toujours besoin de tourner la page. Un fauteuil de famille, une chaise usée, une banquette à reprendre ou un canapé marqué par le temps gardent souvent en eux une vraie présence. Une patine usée, un tissu effiloché, une assise fatiguée : autant de traces qui racontent quelque chose de beau et méritent d'être observées avec attention.")
        ),
        philosophy: doc(
          p("Avec Si les fauteuils parlaient, mon atelier de tapisserie près de Toulouse (31), je travaille pour celles et ceux qui veulent préserver, faire durer et sublimer ce qui mérite de l'être."),
          p("Nous partageons la même conviction : un bel intérieur se construit aussi dans l'envie de donner une seconde vie à des fauteuils qui ont du caractère. Au quotidien, je respecte l'âme de chaque pièce, sublime ses lignes et soigne chaque finition pour qu'elle retrouve sa place dans votre quotidien avec justesse, élégance et évidence."),
          p("Certaines restaurations demandent plus qu'un travail de tapisserie. Lorsque la pièce l'exige, je fais appel à des partenaires de confiance aux savoir-faire complémentaires : aérogommage, peinture décorative, ébénisterie ou interventions plus spécifiques sur des sièges de caractère, afin de préserver la cohérence et la qualité du résultat final. Ensemble nous réalisons une restauration juste, soignée et durable.")
        ),
        portrait: asset("/images/philo.JPG", "Portrait de Céline Blin dans son atelier"),
        button_text: "Envoyer un message",
        button_link: route("/contact"),
      },
      {
        component: "process",
        title: "Je vais faire de votre meuble usé ou oublié l'une des pièces maîtresse de votre aménagement intérieur.",
        steps: [
          { component: "process_step", text: "Utilisez le formulaire de contact pour me transmettre votre demande et vos photos." },
          { component: "process_step", text: "Vous recevez une estimation chiffrée de la rénovation avec proposition de tissus et étapes indispensables. Selon la complexité du projet, je me rends chez vous pour une étude précise de votre bien." },
          { component: "process_step", text: "Je me déplace à votre domicile pour évaluer précisément les travaux à faire, ou vous m'apportez votre siège à l'atelier, à votre convenance." },
          { component: "process_step", text: "Dès que vous avez choisi le tissu et les finitions, vous recevez votre devis gratuit détaillé." },
          { component: "process_step", text: "Après le paiement d'un acompte de 50%, je commence la restauration." },
        ],
        outro: doc(
          p("Comptez entre 2 et 15 jours pour le travail de réfection, parfois un peu plus selon la technicité, les matériaux et l'approvisionnement du tissu. Le délai est contractualisé lors du devis."),
          p("Je vous livre votre assise restaurée à domicile :"),
          p("gratuitement dans un rayon de 20 km autour de Roquettes (31)"),
          p("frais de déplacement à prévoir au-delà")
        ),
        button_text: "Me présenter votre projet",
        button_link: route("/contact"),
      },
      {
        component: "gallery",
        heading: "Autres travaux de tapisserie et couture",
        text: doc(
          p("- Sellerie légère"),
          p("- Travaux de couture"),
          p("- Petites réparations"),
          p("Banquettes, coussins, assises sur mesure, banquettes médicales, fauteuils dentaires, banquettes de caravane, changement de fermetures Éclair… : j'étudie tous vos projets et vous informe en toute transparence de la faisabilité des travaux par mon atelier.")
        ),
        items: [
          { component: "gallery_item", image: asset("/images/troika.JPG", "Fauteuil Troïka avec assise et dossier restaurés"), caption: "Fauteuil Troïka Guariche" },
          { component: "gallery_item", image: asset("/images/vintage.jpeg", "Chaise vintage"), caption: "Chaise vintage" },
          { component: "gallery_item", image: asset("/images/selles.jpeg", "Selles de vélo"), caption: "Selles de vélo" },
          { component: "gallery_item", image: asset("/images/tissu.JPG", "Impression sur tissu sur mesure"), caption: "Projets sur-mesure" },
        ],
      },
      {
        component: "gallery",
        heading: "Je chine pour vous",
        text: doc(
          p("Avec Si les fauteuils parlaient, je chine aussi pour vous des meubles vintage, dans le style que vous cherchez pour votre intérieur. Je m'occupe de leur restauration ou vous les vends en l'état.")
        ),
        items: [
          { component: "gallery_item", image: asset("/images/resto.jpg", "Chaise de bureau chinée"), caption: "Chaise de bureau" },
          { component: "gallery_item", image: asset("/images/vintage.JPG", "Fauteuil vintage"), caption: "Fauteuil vintage" },
          { component: "gallery_item", image: asset("/images/fauteuil studio.jpg", "Fauteuil studio chiné"), caption: "Fauteuil studio" },
          { component: "gallery_item", image: asset("/images/fauteuil rockabilly.jpg", "Fauteuil rockabilly chiné"), caption: "Fauteuil rockabilly" },
        ],
      },
      {
        component: "cta",
        headline: "Pour une esthétique durable & responsable",
        text: doc(
          p("Confier un siège à un tapissier d'ameublement autour de vous, c'est choisir une esthétique durable et responsable. Vous préservez un meuble auquel vous tenez, vous valorisez ce qui existe déjà, et vous offrez à votre intérieur une pièce pensée pour durer, avec un niveau de finition en accord avec son caractère."),
          bulletList(
            "Devis gratuit et diagnostic honnête, sans travaux inutiles",
            "Accompagnement dans le choix des tissus et des finitions",
            "Restauration soignée, pensée autant pour le confort que pour le rendu visuel",
            "Atelier basé à Roquettes, au sud de Toulouse (Haute-Garonne)",
            "Possibilité d'un premier avis à distance à partir de photos"
          )
        ),
        button_text: "Me présenter votre projet",
        button_link: route("/contact"),
      },
      {
        component: "faq",
        title: "Vos questions",
        items: [
          { component: "faq_item", question: "Combien coûte la restauration d'un fauteuil ?", answer: doc(p("Le prix d'une rénovation dépend de l'état du siège, du garnissage à reprendre, du tissu choisi et des finitions. L'enlèvement et la livraison sont gratuits si vous vivez autour de Roquettes (15-20km). Au-delà, des frais de déplacement s'appliquent. Contactez-moi pour un prix précis.")) },
          { component: "faq_item", question: "Intervenez-vous uniquement à Roquettes ?", answer: doc(p("L'atelier de tapisserie est basé à Roquettes, mais les demandes viennent aussi de Toulouse, Muret, Portet-sur-Garonne, Cugnaux, Villeneuve-Tolosane, Frouzins, Seysses, Roques, Pins-Justaret et des communes voisines. Équipée d'un véhicule adapté, je me charge de l'enlèvement et de la livraison de vos fauteuils et objets plus volumineux.")) },
          { component: "faq_item", question: "Peut-on obtenir un devis sans se déplacer ?", answer: doc(p("Je vous fais un premier retour à partir de photos de votre assise. Merci de m'envoyer une vue d'ensemble, le dessous de l'assise et le dos pour mieux évaluer le travail à prévoir. Ensuite, je me déplace chez vous pour préciser le travail à réaliser et bien cerner vos attentes. Je vous livre alors un devis gratuit détaillant précisément les travaux de réfection prévus.")) },
          { component: "faq_item", question: "En combien de temps vais-je récupérer mon bien ?", answer: doc(p("Quand le projet est validé, que l'acompte est versé et que les matériaux sont disponibles, le temps de travail se situe généralement entre 2 jours et 15 jours, avec certains projets pouvant aller jusqu'à environ 3 semaines. Je vous précise exactement le délai lors de la signature du devis.")) },
          { component: "faq_item", question: "Faites-vous uniquement de la restauration de fauteuils ?", answer: doc(p("Non, mon atelier restaure tous les types d'assises (fauteuils, canapés, chaises, sellerie légère…) et propose aussi de petites réparations et travaux de couture associés (coussins, fermetures éclairs…). Je chine aussi pour vous le meuble de vos rêves et le restaure si nécessaire !")) },
          { component: "faq_item", question: "Faites-vous le décapage des bois ?", answer: doc(p("Je ne réalise pas moi-même le décapage ou l'aérogommage du bois, mais je travaille avec un artisan partenaire spécialisé. De même, si votre assise nécessite une remise en peinture, je peux faire appel à un collaborateur de confiance. Je me charge de coordonner les échanges et de vous transmettre un devis pour l'ensemble de la prestation.")) },
          { component: "faq_item", question: "Réalisez-vous des abat-jours sur mesure ?", answer: doc(p("La confection d'abat-jours pour vos luminaires est un savoir-faire bien spécifique pour lequel je m'associe avec une collègue créatrice de confiance. Selon votre projet, je peux soit lui confier votre demande en sous-traitance pour vous livrer un ensemble complet, soit vous orienter directement vers elle afin que vous conceviez ensemble l'abat-jour idéal.")) },
          { component: "faq_item", question: "Est-ce que mon fauteuil vaut la peine d'être restauré ?", answer: doc(p("Quasiment toujours. Si la structure est saine, elle est souvent en bois massif de qualité bien supérieure au mobilier moderne. Le restaurer, c'est, au-delà de la préservation sentimentale d'un patrimoine familial, s'offrir une pièce unique tout en faisant un choix écoresponsable et durable.")) },
          { component: "faq_item", question: "Et pour les sièges récents ou industriels ?", answer: doc(p("Dans certains cas, la réfection artisanale (main-d'œuvre et matériaux de qualité) peut représenter un coût équivalent ou supérieur au prix d'achat initial. Cependant, restaurer, c'est augmenter considérablement la durée de vie de l'objet : souvent, les mousses sont encore en bon état et jeter cette matière première est très polluant. Choisir la réfection, c'est conserver un mobilier qui vous est familier tout en prenant un engagement écologique, avec la garantie de repartir sur une couverture de qualité.")) },
          { component: "faq_item", question: "Mon animal de compagnie a dévoré l'accoudoir de mon canapé : dois-je tout refaire ?", answer: doc(p("Pas obligatoirement ! Il existe des solutions techniques et esthétiques pour régler cela. Contactez-moi avec une photo du problème et je vous proposerai une solution adaptée.")) },
        ],
      },
      {
        component: "cta",
        headline: "Vous recherchez un tapissier à Roquettes près de Toulouse ?",
        text: doc(
          p("Tapisser un fauteuil, restaurer une chaise, rembourrer un canapé ou améliorer le confort d'une assise : Si les fauteuils parlaient est là pour vous aider !")
        ),
        button_text: "Demander un devis gratuit",
        button_link: route("/contact"),
      },
    ],
  },

  contact: {
    component: "page",
    title: "Restauration de fauteuils & canapés : devis gratuit sur photos",
    description:
      "Contactez Si les fauteuils parlaient, atelier de tapisserie à Roquettes (31) | Devis gratuit sur photos | Restauration complète, couture et petites réparations",
    robots: "all",
    body: [
      {
        component: "intro",
        heading: "Demander un devis : estimation gratuite sur photo de votre restauration d'assises",
        subtitle: "Votre projet de restauration de sièges mérite une attention sur mesure.",
        background_image: asset("/images/atelier.JPG", "Atelier de tapisserie"),
      },
      {
        component: "contact_form",
        description: doc(
          p("Pour établir une estimation juste,"),
          p("1- Ajoutez quelques photos à votre message (vue d'ensemble, vue du dessous de l'assise et du dos) : elles aideront à mieux lire la pièce et à affiner la première proposition. Sans photo, je ne peux pas estimer le prix de votre rénovation."),
          p("2- Précisez-moi simplement :"),
          p("- L'histoire et l'usage du siège : est-ce un meuble de famille ? Envisagez-vous un usage quotidien ou décoratif ?"),
          p("- Le confort souhaité : préférez-vous une assise plutôt ferme ou moelleuse ?"),
          p("- Vos envies esthétiques : teintes, motifs, finitions... pas d'inquiétude si vous n'avez pas encore tranché ! L'atelier vous propose une large sélection de tissus d'éditeurs professionnels. Je vous conseille et vous accompagne pour choisir la matière idéale et construire une restauration cohérente, durable et élégante."),
          p("À noter : C'est lors de l'examen du siège que je déterminerai la technique (traditionnelle ou mousse) et l'état réel de la garniture. Par souci d'écologie, je ne remplace jamais ce qui peut encore durer, mais pour garantir la longévité de votre meuble, il est parfois indispensable de refaire les fondations !")
        ),
      },
      {
        component: "contact_gallery",
        image: asset("/images/atelier.JPG", "Atelier de tapisserie"),
      },
    ],
  },

  "mentions-legales": {
    component: "page",
    title: "Mentions Légales",
    description: "Mentions légales du site silesfauteuils.fr",
    robots: "noindex",
    body: [
      {
        component: "intro",
        heading: "Mentions Légales",
        subtitle: "",
        background_image: asset("/images/hero1.JPG", ""),
      },
      {
        component: "amenities",
        badge: "",
        heading: "Mentions Légales",
        body: doc(
          p("Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs et visiteurs du site silesfauteuils.fr les informations suivantes :"),
          p("ÉDITEUR Le site silesfauteuils.fr est la propriété exclusive de BLIN Céline, autoentrepreneur, qui l'édite. 06 50 72 78 43 - 8 rue du moulin 31120 ROQUETTES Immatriculée au Registre du Commerce et des Sociétés de VILLE sous le numéro 903321180 Numéro TVA intracommunautaire : RAS Directeur de la publication : Céline Blin Contactez le responsable de la publication : silesfauteuils@mailo.com Créateur du site : Huitquatre HÉBERGEMENT Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis")
        ),
      },
    ],
  },

  "politique-de-confidentialite": {
    component: "page",
    title: "Politique de Confidentialité",
    description: "Politique de confidentialité du site silesfauteuils.fr",
    robots: "noindex",
    body: [
      {
        component: "intro",
        heading: "Politique de Confidentialité",
        subtitle: "",
        background_image: asset("/images/hero1.JPG", ""),
      },
      {
        component: "amenities",
        badge: "",
        heading: "Confidentialité",
        body: doc(
          p("Parce que je respecte votre vie privée, ce site ne collecte aucun cookie ! Bonne visite.")
        ),
      },
    ],
  },
}

// ── Write ────────────────────────────────────────────────────────────────────

const outPath = join(__dirname, "storyblok-content.json")
writeFileSync(outPath, JSON.stringify(content, null, 2), "utf8")
console.log(`✅ Written ${outPath}`)
