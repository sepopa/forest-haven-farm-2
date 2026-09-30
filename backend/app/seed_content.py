"""Default site content used to seed the `content_blocks` table on first run.

This mirrors the copy that used to live only in the frontend's static data
files (frontend/src/i18n/strings.js and frontend/src/data/*.js). Once seeded,
the database — editable from the admin panel — is the source of truth; these
dicts are only the starting point for a fresh install.
"""

STRINGS_EN = {
    "nav": {
        "home": "Home", "menu": "Menu", "history": "History", "process": "Process",
        "orders": "Orders", "faq": "FAQ", "contact": "Contact", "placeOrder": "Place an Order",
    },
    "footer": {
        "tagline": "Small-batch, naturally leavened sourdough baked slow on our family farm. No commercial yeast — just flour, water, salt and time.",
        "explore": "Explore", "support": "Support", "visit": "Visit the Farm Stand",
        "hours": "Fri & Sat, 9am – 1pm", "pickupPolicy": "Pickup Policy",
        "ourHistory": "Our History", "ourProcess": "Our Process", "orderBread": "Order Bread",
        "contactUs": "Contact Us", "rights": "© 2026 Forest Haven Farm. All rights reserved.",
        "placeholderNote": "Site content is a placeholder draft — replace with your real story, prices, and remaining photos.",
    },
    "home": {
        "eyebrowHero": "Small-Batch · Naturally Leavened",
        "h1": "Real sourdough bread, baked the slow way at Forest Haven Farm",
        "lede": "No commercial yeast, no shortcuts. Just farm-grown grain, a 10-year-old starter, and a 48-hour ferment — baked in small batches every week and shared with our neighbors.",
        "viewMenu": "View the Menu", "placeOrder": "Place an Order",
        "statStarterYears": "10 yrs", "statStarterLabel": "Starter age",
        "statLoaves": "120+", "statLoavesLabel": "Loaves baked weekly",
        "statFerment": "48 hrs", "statFermentLabel": "Slow fermentation",
        "heroPhotoTag": "Fresh from the oven",
        "heroPhotoAlt": "A freshly baked, hand-scored sourdough boule cooling on a wire rack at Forest Haven Farm",
        "badgeTitle": "Farm-Grown Grain", "badgeSubtitle": "Milled & baked on-site",
        "whyEyebrow": "Why Forest Haven", "whyH2": "Baked with patience, not shortcuts",
        "cardGrainTitle": "Farm-Grown Grain",
        "cardGrainText": "Wheat and rye grown and stone-milled close to home, so every loaf tastes like where it came from.",
        "cardFermentTitle": "Long Fermentation",
        "cardFermentText": "A 48-hour cold ferment breaks the grain down slowly for a deeper flavor and an easier-to-digest loaf.",
        "cardBatchTitle": "Small Batches Only",
        "cardBatchText": "We bake what our community needs each week — nothing mass-produced, nothing sitting on a shelf.",
        "reelEyebrow": "From the Farm & Oven", "reelH2": "A look at what we're baking",
        "reelNote": "Real photos and a real reveal clip from the Forest Haven kitchen — more will join them as they come off the next bake.",
        "followTitle": "Follow the daily bake on Instagram",
        "followText": "@foresthavenfarm — behind-the-scenes reels of the starter, the farm, and the oven.",
        "followBtn": "Follow @foresthavenfarm",
        "bestSellersEyebrow": "Best Sellers", "bestSellersH2": "A few favorites from the menu",
        "boule": {"name": "Classic Country Boule", "text": "Our everyday loaf — crackling crust, open airy crumb, tangy but balanced.", "price": "$9"},
        "focaccia": {"name": "Rosemary & Sea Salt Focaccia", "text": "Farm rosemary, flaky salt, olive oil — baked in sheet pans and cut to order.", "price": "$12"},
        "rolls": {"name": "Sesame Sourdough Rolls", "text": "Soft naturally leavened dinner rolls, topped with toasted sesame & poppy seed.", "price": "$8"},
        "seeFullMenu": "See Full Menu",
        "quote": "“The best sourdough I've had outside of a real French bakery — and it's baked twenty minutes from my house. Worth every bit of the pre-order wait.”",
        "quoteWho": "Regular Saturday Customer", "quoteWhere": "Sylvan Ridge Farmers Market",
        "readyEyebrow": "Ready to Order", "readyH2": "Reserve your loaf before Saturday's bake",
        "readyText": "We bake to order in small weekly batches, so pre-ordering guarantees your bread is set aside with your name on it.",
    },
    "menu": {
        "breadcrumb": "Menu", "eyebrow": "The Menu", "h1": "Baked fresh, in small weekly batches",
        "lede": "Every loaf starts with our 10-year sourdough starter and a 48-hour ferment. Availability rotates with what's baking that week — pre-order to guarantee yours.",
        "note": "All loaves are made with wheat flour and are not gluten-free. Some items contain dairy, nuts, or honey — ask us about any allergen before ordering. Bread is baked to order; please place your request at least 48 hours ahead using the",
        "noteGoodToKnow": "Good to know:", "noteOrdersLink": "Orders page",
        "orderFromMenu": "Order From This Menu",
    },
    "history": {
        "breadcrumb": "History", "eyebrow": "Our Story",
        "h1": "From one kitchen starter to a working farm bakery",
        "lede": "Forest Haven Farm started the way most good sourdough does: slowly, with a lot of patience and a little stubbornness.",
        "howStartedEyebrow": "How it started",
        "howStartedH2": "A family farm, a kitchen starter, and a lot of trial and error",
        "p1": "Forest Haven Farm is a small, family-run farm and bakery. What started as one home baker learning to keep a wild sourdough starter alive turned into weekly bakes for neighbors, then a stand at the local farmers market, and eventually a wood-fired oven built right on the property.",
        "p2": "We still measure success the same way we did in year one: does the bread taste like it was made with care? Everything else — the farm stand, the market table, the Instagram page — grew up around that one question.",
        "photoTag": "From Our Kitchen",
        "photoAlt": "Four small sourdough boules cooling on a wooden rack next to a farmhouse calendar",
        "milestonesEyebrow": "Milestones", "milestonesH2": "How we got here",
        "valuesEyebrow": "What We Believe", "valuesH2": "The values behind every loaf",
        "valueGrownTitle": "Grown, Not Just Sourced",
        "valueGrownText": "We grow and mill as much of our own grain as the farm allows, and buy the rest from growers we know by name.",
        "valueSlowTitle": "Slow On Purpose",
        "valueSlowText": "Long fermentation isn't a trend for us — it's the only way we know how to get real flavor and a bread that's easier to digest.",
        "valueNeighborsTitle": "Baked for Neighbors",
        "valueNeighborsText": "We bake what our community can eat that week. No freezer stock, no shipping pallets — just fresh bread for people nearby.",
    },
    "process": {
        "breadcrumb": "Process", "eyebrow": "How We Bake", "h1": "Three days, seven steps, one loaf",
        "lede": "There's no shortcut version of real sourdough. Here's exactly what happens between feeding the starter and pulling a loaf out of the oven.",
        "photoTag": "Fresh Off the Bake",
        "photoAlt": "Close-up of a hand-scored sourdough boule showing the wheat-stalk scoring pattern and golden crust",
        "noShortcutsEyebrow": "No shortcuts", "whyH2": "Why we ferment for 48 hours",
        "whyText": "Commercial yeast can proof a loaf in two hours. Our wild starter takes closer to two days — and that difference is where the flavor, digestibility, and crust all come from. It's slower, less predictable, and worth it every time.",
        "stepsEyebrow": "Start to Finish", "stepsH2": "The full bake, step by step",
        "curiousEyebrow": "Curious How It Tastes?", "curiousH2": "See this week's bake on the menu",
        "curiousText": "Every step above goes into every loaf we sell — browse what's available this week.",
        "viewMenu": "View the Menu",
    },
    "orders": {
        "breadcrumb": "Orders", "eyebrow": "Order Ahead", "h1": "Reserve your loaves for the next bake",
        "lede": "We bake in small weekly batches, so pre-ordering is the only way to guarantee your bread. Submit a request below and we'll confirm by email or phone.",
        "formTitle": "Order Request Form",
        "formIntro": "This reserves your bread — it isn't an online payment. We'll confirm your pickup details and take payment (cash, card, or Venmo) at pickup.",
        "fullName": "Full Name", "email": "Email", "phone": "Phone",
        "pickupDate": "Preferred Pickup Date", "bread": "Bread", "selectLoaf": "Select a loaf…",
        "quantity": "Quantity", "pickupLocation": "Pickup Location",
        "farmStandOption": "Farm Stand — 412 Millbrook Hollow Rd",
        "marketOption": "Sylvan Ridge Farmers Market (Saturdays)",
        "notesLabel": "Notes or Allergies", "optional": "(optional)",
        "notesPlaceholder": "Let us know about allergies, a custom request, or your preferred pickup time.",
        "policyLabel": "I understand this reserves my order and payment is due at pickup, and that unclaimed pre-orders after 30 minutes past pickup time may be released.",
        "submitting": "Submitting…", "submit": "Submit Order Request",
        "policyError": "Please confirm the pickup policy checkbox before submitting.",
        "successMsg": "Thanks! Your order request was received — we'll confirm by email or phone within 24 hours.",
        "errorMsg": "We couldn't reach the order system right now (is the backend running?). Please email hello@foresthavenfarm.com and we'll get you booked in.",
        "beforeOrderTitle": "Before You Order",
        "leadTimeBold": "48-hour lead time.", "leadTimeText": "Orders placed after Wednesday may roll to the following week's bake.",
        "pickupSpotsBold": "Two pickup spots.", "pickupSpotsText": "The farm stand (Fri & Sat, 9am–1pm) or our Saturday farmers market table.",
        "paymentBold": "Payment at pickup.", "paymentText": "We accept cash, card, and Venmo — nothing is charged online.",
        "confirmationBold": "Confirmation.", "confirmationText": "We'll email or call within 24 hours to confirm your order and exact pickup time.",
        "quote": "“Pre-ordering takes two minutes and means I never show up to an empty table again.”",
        "quoteWho": "Weekly CSB Member", "quoteWhere": "Forest Haven Farm",
        "breadOptions": [
            "Classic Country Boule — $9", "Whole Wheat Sourdough — $10", "Rustic Rye Sourdough — $10",
            "Seeded Multigrain Loaf — $11", "Honey Oat Sourdough — $10", "Cinnamon Raisin Swirl — $11",
            "Rosemary & Sea Salt Focaccia — $12", "Jalapeño Cheddar Sourdough — $12", "Seasonal Special — Market Price",
        ],
    },
    "faq": {
        "breadcrumb": "FAQ", "eyebrow": "Good to Know", "h1": "Frequently asked questions",
        "lede": "Everything we get asked most often about ordering, pickup, and what goes into every loaf.",
        "stillQuestion": "Still have a question?", "contactUs": "Contact Us",
    },
    "contact": {
        "breadcrumb": "Contact", "eyebrow": "Get In Touch", "h1": "We'd love to hear from you",
        "lede": "Questions about an order, custom bakes, wholesale, or just want to say hi — reach out below.",
        "detailsTitle": "Contact Details", "farmStand": "Farm Stand",
        "farmStandAddr": "412 Millbrook Hollow Rd, Sylvan Ridge, VT 05450",
        "hoursTitle": "Hours", "hoursText": "Friday & Saturday, 9am–1pm · Saturdays also at Sylvan Ridge Farmers Market",
        "emailTitle": "Email", "phoneTitle": "Phone",
        "mapPlaceholder": "Map placeholder — embed a real map to the farm stand here",
        "sendMessageTitle": "Send a Message", "fullName": "Full Name", "email": "Email", "subject": "Subject",
        "selectTopic": "Select a topic…", "topicOrder": "Order Question", "topicCustom": "Custom / Wedding Order",
        "topicWholesale": "Wholesale Inquiry", "topicGeneral": "General Question", "topicOther": "Other",
        "message": "Message", "messagePlaceholder": "How can we help?", "sending": "Sending…", "send": "Send Message",
        "successMsg": "Message sent — thanks for reaching out! We'll reply within a day or two.",
        "errorMsg": "We couldn't reach the server right now (is the backend running?). Please email hello@foresthavenfarm.com directly.",
    },
}

STRINGS_ES = {
    "nav": {
        "home": "Inicio", "menu": "Menú", "history": "Historia", "process": "Proceso",
        "orders": "Pedidos", "faq": "Preguntas", "contact": "Contacto", "placeOrder": "Hacer un Pedido",
    },
    "footer": {
        "tagline": "Pan de masa madre en pequeños lotes, horneado despacio en nuestra granja familiar. Sin levadura comercial: solo harina, agua, sal y tiempo.",
        "explore": "Explorar", "support": "Ayuda", "visit": "Visita el Puesto de la Granja",
        "hours": "Vie y sáb, 9am – 1pm", "pickupPolicy": "Política de Recogida",
        "ourHistory": "Nuestra Historia", "ourProcess": "Nuestro Proceso", "orderBread": "Pedir Pan",
        "contactUs": "Contáctanos", "rights": "© 2026 Forest Haven Farm. Todos los derechos reservados.",
        "placeholderNote": "El contenido del sitio es un borrador de ejemplo — reemplázalo con tu historia real, precios y fotos restantes.",
    },
    "home": {
        "eyebrowHero": "Lotes Pequeños · Fermentación Natural",
        "h1": "Pan de masa madre de verdad, horneado despacio en Forest Haven Farm",
        "lede": "Sin levadura comercial, sin atajos. Solo grano cultivado en la granja, un fermento madre de 10 años y una fermentación de 48 horas — horneado en pequeños lotes cada semana y compartido con nuestros vecinos.",
        "viewMenu": "Ver el Menú", "placeOrder": "Hacer un Pedido",
        "statStarterYears": "10 años", "statStarterLabel": "Edad del fermento",
        "statLoaves": "120+", "statLoavesLabel": "Panes horneados por semana",
        "statFerment": "48 hrs", "statFermentLabel": "Fermentación lenta",
        "heroPhotoTag": "Recién salido del horno",
        "heroPhotoAlt": "Un pan de masa madre recién horneado y marcado a mano, enfriándose en una rejilla en Forest Haven Farm",
        "badgeTitle": "Grano Cultivado en la Granja", "badgeSubtitle": "Molido y horneado en el lugar",
        "whyEyebrow": "Por Qué Forest Haven", "whyH2": "Horneado con paciencia, no con atajos",
        "cardGrainTitle": "Grano Cultivado en la Granja",
        "cardGrainText": "Trigo y centeno cultivados y molidos en piedra cerca de casa, para que cada pan sepa a su origen.",
        "cardFermentTitle": "Fermentación Larga",
        "cardFermentText": "Una fermentación fría de 48 horas descompone el grano lentamente, dando más sabor y un pan más fácil de digerir.",
        "cardBatchTitle": "Solo Lotes Pequeños",
        "cardBatchText": "Horneamos lo que nuestra comunidad necesita cada semana — nada de producción masiva, nada guardado en un estante.",
        "reelEyebrow": "De la Granja y el Horno", "reelH2": "Un vistazo a lo que estamos horneando",
        "reelNote": "Fotos y un video real de la cocina de Forest Haven — se sumarán más a medida que salgan del próximo horneado.",
        "followTitle": "Sigue el horneado diario en Instagram",
        "followText": "@foresthavenfarm — videos detrás de escena del fermento, la granja y el horno.",
        "followBtn": "Seguir a @foresthavenfarm",
        "bestSellersEyebrow": "Los Más Vendidos", "bestSellersH2": "Algunos favoritos del menú",
        "boule": {"name": "Boule Clásico Campestre", "text": "Nuestro pan de cada día — corteza crujiente, miga aireada, ácido pero equilibrado.", "price": "$9"},
        "focaccia": {"name": "Focaccia de Romero y Sal Marina", "text": "Romero de la granja, sal en escamas, aceite de oliva — horneada en bandejas y cortada al pedido.", "price": "$12"},
        "rolls": {"name": "Panecillos de Sésamo con Masa Madre", "text": "Panecillos suaves de fermentación natural, cubiertos con sésamo tostado y semillas de amapola.", "price": "$8"},
        "seeFullMenu": "Ver Menú Completo",
        "quote": "“El mejor pan de masa madre que he probado fuera de una panadería francesa de verdad — y se hornea a veinte minutos de mi casa. Vale la pena cada minuto de espera del pedido anticipado.”",
        "quoteWho": "Cliente Habitual de los Sábados", "quoteWhere": "Mercado de Agricultores de Sylvan Ridge",
        "readyEyebrow": "Listo para Pedir", "readyH2": "Reserva tu pan antes del horneado del sábado",
        "readyText": "Horneamos bajo pedido en pequeños lotes semanales, así que reservar con anticipación garantiza que tu pan quede apartado con tu nombre.",
    },
    "menu": {
        "breadcrumb": "Menú", "eyebrow": "El Menú", "h1": "Horneado fresco, en pequeños lotes semanales",
        "lede": "Cada pan comienza con nuestro fermento madre de 10 años y una fermentación de 48 horas. La disponibilidad cambia según lo que se hornee esa semana — reserva con anticipación para asegurar el tuyo.",
        "note": "Todos los panes se hacen con harina de trigo y no son aptos para celíacos. Algunos artículos contienen lácteos, frutos secos o miel — pregúntanos sobre cualquier alérgeno antes de pedir. El pan se hornea bajo pedido; realiza tu solicitud con al menos 48 horas de anticipación usando la",
        "noteGoodToKnow": "Bueno saberlo:", "noteOrdersLink": "página de Pedidos",
        "orderFromMenu": "Pedir de Este Menú",
    },
    "history": {
        "breadcrumb": "Historia", "eyebrow": "Nuestra Historia",
        "h1": "De un fermento casero a una panadería de granja en funcionamiento",
        "lede": "Forest Haven Farm empezó como empieza la mayoría del buen pan de masa madre: despacio, con mucha paciencia y algo de terquedad.",
        "howStartedEyebrow": "Cómo empezó",
        "howStartedH2": "Una granja familiar, un fermento casero y mucho ensayo y error",
        "p1": "Forest Haven Farm es una pequeña granja y panadería familiar. Lo que comenzó como una persona horneando en casa, aprendiendo a mantener vivo un fermento salvaje, se convirtió en horneados semanales para los vecinos, luego un puesto en el mercado de agricultores local y, finalmente, un horno de leña construido en la propiedad.",
        "p2": "Seguimos midiendo el éxito igual que en el primer año: ¿el pan sabe a que fue hecho con cuidado? Todo lo demás — el puesto de la granja, la mesa del mercado, la página de Instagram — creció alrededor de esa única pregunta.",
        "photoTag": "De Nuestra Cocina",
        "photoAlt": "Cuatro pequeños boules de masa madre enfriándose en una rejilla de madera junto a un calendario de granja",
        "milestonesEyebrow": "Hitos", "milestonesH2": "Cómo llegamos aquí",
        "valuesEyebrow": "En Qué Creemos", "valuesH2": "Los valores detrás de cada pan",
        "valueGrownTitle": "Cultivado, No Solo Comprado",
        "valueGrownText": "Cultivamos y molemos tanto grano propio como la granja lo permite, y compramos el resto a productores que conocemos por nombre.",
        "valueSlowTitle": "Lento a Propósito",
        "valueSlowText": "La fermentación larga no es una moda para nosotros — es la única forma que conocemos de lograr sabor real y un pan más fácil de digerir.",
        "valueNeighborsTitle": "Horneado para los Vecinos",
        "valueNeighborsText": "Horneamos lo que nuestra comunidad puede comer esa semana. Sin stock en congelador, sin pallets de envío — solo pan fresco para la gente cercana.",
    },
    "process": {
        "breadcrumb": "Proceso", "eyebrow": "Cómo Horneamos", "h1": "Tres días, siete pasos, un pan",
        "lede": "No existe una versión rápida del verdadero pan de masa madre. Esto es exactamente lo que pasa entre alimentar el fermento y sacar un pan del horno.",
        "photoTag": "Recién Horneado",
        "photoAlt": "Primer plano de un boule de masa madre marcado a mano, mostrando el patrón de espiga de trigo y una corteza dorada",
        "noShortcutsEyebrow": "Sin atajos", "whyH2": "Por qué fermentamos durante 48 horas",
        "whyText": "La levadura comercial puede leudar un pan en dos horas. Nuestro fermento salvaje tarda casi dos días — y esa diferencia es de donde vienen el sabor, la digestibilidad y la corteza. Es más lento, menos predecible y vale la pena cada vez.",
        "stepsEyebrow": "De Principio a Fin", "stepsH2": "El horneado completo, paso a paso",
        "curiousEyebrow": "¿Curiosidad por Probarlo?", "curiousH2": "Mira el horneado de esta semana en el menú",
        "curiousText": "Cada paso anterior forma parte de cada pan que vendemos — explora lo disponible esta semana.",
        "viewMenu": "Ver el Menú",
    },
    "orders": {
        "breadcrumb": "Pedidos", "eyebrow": "Pide con Anticipación", "h1": "Reserva tus panes para el próximo horneado",
        "lede": "Horneamos en pequeños lotes semanales, así que reservar con anticipación es la única forma de garantizar tu pan. Envía una solicitud abajo y confirmaremos por correo o teléfono.",
        "formTitle": "Formulario de Solicitud de Pedido",
        "formIntro": "Esto reserva tu pan — no es un pago en línea. Confirmaremos los detalles de tu recogida y cobraremos (efectivo, tarjeta o Venmo) al momento de recoger.",
        "fullName": "Nombre Completo", "email": "Correo Electrónico", "phone": "Teléfono",
        "pickupDate": "Fecha de Recogida Preferida", "bread": "Pan", "selectLoaf": "Selecciona un pan…",
        "quantity": "Cantidad", "pickupLocation": "Lugar de Recogida",
        "farmStandOption": "Puesto de la Granja — 412 Millbrook Hollow Rd",
        "marketOption": "Mercado de Agricultores de Sylvan Ridge (sábados)",
        "notesLabel": "Notas o Alergias", "optional": "(opcional)",
        "notesPlaceholder": "Cuéntanos sobre alergias, un pedido especial o tu horario de recogida preferido.",
        "policyLabel": "Entiendo que esto reserva mi pedido y que el pago se realiza al recogerlo, y que los pedidos no reclamados 30 minutos después de la hora de recogida pueden liberarse.",
        "submitting": "Enviando…", "submit": "Enviar Solicitud de Pedido",
        "policyError": "Por favor confirma la casilla de política de recogida antes de enviar.",
        "successMsg": "¡Gracias! Recibimos tu solicitud de pedido — confirmaremos por correo o teléfono dentro de 24 horas.",
        "errorMsg": "No pudimos conectar con el sistema de pedidos en este momento (¿está el backend en funcionamiento?). Envía un correo a hello@foresthavenfarm.com y te agendaremos.",
        "beforeOrderTitle": "Antes de Pedir",
        "leadTimeBold": "48 horas de anticipación.", "leadTimeText": "Los pedidos hechos después del miércoles pueden pasar al horneado de la semana siguiente.",
        "pickupSpotsBold": "Dos lugares de recogida.", "pickupSpotsText": "El puesto de la granja (vie y sáb, 9am–1pm) o nuestra mesa del mercado de agricultores los sábados.",
        "paymentBold": "Pago al recoger.", "paymentText": "Aceptamos efectivo, tarjeta y Venmo — nada se cobra en línea.",
        "confirmationBold": "Confirmación.", "confirmationText": "Te llamaremos o enviaremos un correo dentro de 24 horas para confirmar tu pedido y la hora exacta de recogida.",
        "quote": "“Reservar con anticipación toma dos minutos y significa que nunca más llego a una mesa vacía.”",
        "quoteWho": "Miembro Semanal del CSB", "quoteWhere": "Forest Haven Farm",
        "breadOptions": [
            "Boule Clásico Campestre — $9", "Masa Madre de Trigo Integral — $10", "Masa Madre de Centeno Rústico — $10",
            "Pan Multigrano con Semillas — $11", "Masa Madre de Avena y Miel — $10", "Espiral de Canela y Pasas — $11",
            "Focaccia de Romero y Sal Marina — $12", "Masa Madre de Jalapeño y Cheddar — $12", "Especial de Temporada — Precio de Mercado",
        ],
    },
    "faq": {
        "breadcrumb": "Preguntas", "eyebrow": "Bueno Saberlo", "h1": "Preguntas frecuentes",
        "lede": "Todo lo que más nos preguntan sobre pedidos, recogida y qué lleva cada pan.",
        "stillQuestion": "¿Aún tienes una pregunta?", "contactUs": "Contáctanos",
    },
    "contact": {
        "breadcrumb": "Contacto", "eyebrow": "Ponte en Contacto", "h1": "Nos encantaría saber de ti",
        "lede": "Preguntas sobre un pedido, horneados personalizados, mayoreo, o simplemente para saludar — escríbenos abajo.",
        "detailsTitle": "Datos de Contacto", "farmStand": "Puesto de la Granja",
        "farmStandAddr": "412 Millbrook Hollow Rd, Sylvan Ridge, VT 05450",
        "hoursTitle": "Horario", "hoursText": "Viernes y sábado, 9am–1pm · Los sábados también en el Mercado de Agricultores de Sylvan Ridge",
        "emailTitle": "Correo Electrónico", "phoneTitle": "Teléfono",
        "mapPlaceholder": "Mapa de ejemplo — inserta aquí un mapa real hacia el puesto de la granja",
        "sendMessageTitle": "Envía un Mensaje", "fullName": "Nombre Completo", "email": "Correo Electrónico", "subject": "Asunto",
        "selectTopic": "Selecciona un tema…", "topicOrder": "Pregunta sobre un Pedido", "topicCustom": "Pedido Personalizado / Boda",
        "topicWholesale": "Consulta de Mayoreo", "topicGeneral": "Pregunta General", "topicOther": "Otro",
        "message": "Mensaje", "messagePlaceholder": "¿Cómo podemos ayudarte?", "sending": "Enviando…", "send": "Enviar Mensaje",
        "successMsg": "Mensaje enviado — ¡gracias por escribirnos! Responderemos en uno o dos días.",
        "errorMsg": "No pudimos conectar con el servidor en este momento (¿está el backend en funcionamiento?). Envía un correo directamente a hello@foresthavenfarm.com.",
    },
}

_G1 = "linear-gradient(155deg, #C08A4F, #5E3119)"
_G2 = "linear-gradient(155deg, #8E9A6E, #4E5A3B)"
_G3 = "linear-gradient(155deg, #D7B36A, #8A4B2B)"
_G4 = "linear-gradient(155deg, #A9673B, #3E2110)"

MENU_ITEMS_EN = [
    {"id": "country-boule", "name": "Classic Country Boule", "description": "Our everyday loaf. Crackling crust, open airy crumb, tangy but balanced. Made with our 10-year starter.", "price": "$9", "category": "loaves", "tag": "Loaves", "photo": "/assets/photos/boule-main-thumb.jpg"},
    {"id": "whole-wheat", "name": "Whole Wheat Sourdough", "description": "70% stone-milled whole wheat for a heartier crumb and a nutty, earthy flavor.", "price": "$10", "category": "loaves", "tag": "Loaves", "gradient": _G2},
    {"id": "rustic-rye", "name": "Rustic Rye Sourdough", "description": "Farm rye blended with bread flour for a dense, deeply flavored loaf that keeps well.", "price": "$10", "category": "loaves", "tag": "Loaves", "gradient": _G3},
    {"id": "seeded-multigrain", "name": "Seeded Multigrain Loaf", "description": "Sunflower, flax, oats and sesame folded into our base dough for crunch in every slice.", "price": "$11", "category": "loaves", "tag": "Loaves", "gradient": _G4},
    {"id": "honey-oat", "name": "Honey Oat Sourdough", "description": "Rolled oats and local honey for a soft, slightly sweet everyday sandwich loaf.", "price": "$10", "category": "loaves", "tag": "Loaves", "gradient": _G1},
    {"id": "sesame-rolls", "name": "Sesame Sourdough Rolls", "description": "Soft naturally leavened dinner rolls topped with toasted sesame & poppy seed. Sold as a 4-pack.", "price": "$8", "category": "rolls", "tag": "Rolls", "photo": "/assets/photos/sesame-rolls-thumb.jpg"},
    {"id": "cinnamon-raisin", "name": "Cinnamon Raisin Swirl", "description": "Naturally leavened and lightly sweet, swirled with cinnamon and plump raisins.", "price": "$11", "category": "sweet", "tag": "Sweet", "gradient": _G3},
    {"id": "focaccia", "name": "Rosemary & Sea Salt Focaccia", "description": "Farm rosemary, flaky salt, olive oil, baked in sheet pans and cut to order.", "price": "$12", "category": "savory", "tag": "Savory", "gradient": _G2},
    {"id": "jalapeno-cheddar", "name": "Jalapeño Cheddar Sourdough", "description": "Sharp cheddar and fresh jalapeño folded through our country dough. Baked Fridays only.", "price": "$12", "category": "savory", "tag": "Savory", "gradient": _G4},
    {"id": "seasonal-special", "name": "Seasonal Special", "description": "A rotating loaf built around what's ready on the farm — ask us what's baking this week.", "price": "Market Price", "category": "seasonal", "tag": "Seasonal", "gradient": _G1},
]

MENU_ITEMS_ES = [
    {"id": "country-boule", "name": "Boule Clásico Campestre", "description": "Nuestro pan de cada día. Corteza crujiente, miga aireada, ácido pero equilibrado. Hecho con nuestro fermento de 10 años.", "price": "$9", "category": "loaves", "tag": "Panes", "photo": "/assets/photos/boule-main-thumb.jpg"},
    {"id": "whole-wheat", "name": "Masa Madre de Trigo Integral", "description": "70% trigo integral molido en piedra para una miga más consistente y un sabor terroso a nuez.", "price": "$10", "category": "loaves", "tag": "Panes", "gradient": _G2},
    {"id": "rustic-rye", "name": "Masa Madre de Centeno Rústico", "description": "Centeno de la granja mezclado con harina de pan para un pan denso, de sabor profundo y buena conservación.", "price": "$10", "category": "loaves", "tag": "Panes", "gradient": _G3},
    {"id": "seeded-multigrain", "name": "Pan Multigrano con Semillas", "description": "Girasol, linaza, avena y sésamo incorporados a nuestra masa base para crujido en cada rebanada.", "price": "$11", "category": "loaves", "tag": "Panes", "gradient": _G4},
    {"id": "honey-oat", "name": "Masa Madre de Avena y Miel", "description": "Avena en hojuelas y miel local para un pan de sándwich suave y ligeramente dulce.", "price": "$10", "category": "loaves", "tag": "Panes", "gradient": _G1},
    {"id": "sesame-rolls", "name": "Panecillos de Sésamo con Masa Madre", "description": "Panecillos suaves de fermentación natural cubiertos con sésamo tostado y semillas de amapola. Se venden en paquete de 4.", "price": "$8", "category": "rolls", "tag": "Panecillos", "photo": "/assets/photos/sesame-rolls-thumb.jpg"},
    {"id": "cinnamon-raisin", "name": "Espiral de Canela y Pasas", "description": "De fermentación natural y ligeramente dulce, con espiral de canela y pasas jugosas.", "price": "$11", "category": "sweet", "tag": "Dulce", "gradient": _G3},
    {"id": "focaccia", "name": "Focaccia de Romero y Sal Marina", "description": "Romero de la granja, sal en escamas, aceite de oliva, horneada en bandejas y cortada al pedido.", "price": "$12", "category": "savory", "tag": "Salado", "gradient": _G2},
    {"id": "jalapeno-cheddar", "name": "Masa Madre de Jalapeño y Cheddar", "description": "Cheddar fuerte y jalapeño fresco incorporados a nuestra masa campestre. Se hornea solo los viernes.", "price": "$12", "category": "savory", "tag": "Salado", "gradient": _G4},
    {"id": "seasonal-special", "name": "Especial de Temporada", "description": "Un pan rotativo según lo que esté listo en la granja — pregúntanos qué se hornea esta semana.", "price": "Precio de Mercado", "category": "seasonal", "tag": "Temporada", "gradient": _G1},
]

MENU_FILTERS_EN = [
    {"id": "all", "label": "All"}, {"id": "loaves", "label": "Sourdough Loaves"}, {"id": "rolls", "label": "Rolls"},
    {"id": "sweet", "label": "Enriched & Sweet"}, {"id": "savory", "label": "Savory"}, {"id": "seasonal", "label": "Seasonal"},
]
MENU_FILTERS_ES = [
    {"id": "all", "label": "Todo"}, {"id": "loaves", "label": "Panes de Masa Madre"}, {"id": "rolls", "label": "Panecillos"},
    {"id": "sweet", "label": "Enriquecidos y Dulces"}, {"id": "savory", "label": "Salados"}, {"id": "seasonal", "label": "Temporada"},
]

FAQ_ITEMS_EN = [
    {"q": "Do you ship bread?", "a": "Not yet — sourdough travels best fresh, so right now we only offer local pickup at the farm stand or the Sylvan Ridge Farmers Market. We're exploring regional shipping for the future."},
    {"q": "How far in advance do I need to order?", "a": "We ask for at least 48 hours' notice. Orders placed after Wednesday evening may roll into the following week's bake, since we only bake what's been reserved plus a small walk-in stock."},
    {"q": "What are your pickup times and locations?", "a": "The farm stand is open Friday and Saturday, 9am–1pm, at 412 Millbrook Hollow Rd. We also have a table at the Sylvan Ridge Farmers Market on Saturdays. You'll choose one when you place your order."},
    {"q": "Is your bread made with commercial yeast?", "a": "No. Every loaf is leavened only with our wild sourdough starter, which has been maintained since 2016. No commercial yeast, dough conditioners, or preservatives go into any loaf."},
    {"q": "Do you offer gluten-free bread?", "a": "Not currently. All of our bread is made with wheat and/or rye flour, so it isn't suitable for gluten-free or celiac diets."},
    {"q": "What allergens should I know about?", "a": "All loaves contain wheat. Some contain dairy, honey, or nuts/seeds (see the Menu page for details on each item). Let us know about any allergy in the notes field when you order and we'll flag it before baking."},
    {"q": "How should I store and refresh my loaf?", "a": "Store cut-side down at room temperature in a paper or bread bag for up to 4 days, or freeze whole/sliced for up to 3 months. A few minutes in a hot oven brings back that fresh-baked crust."},
    {"q": "Do you do custom, wedding, or wholesale orders?", "a": "We do! Reach out through the Contact page with your event date, quantities, and any special requests, and we'll let you know what's possible for that week's baking schedule."},
]
FAQ_ITEMS_ES = [
    {"q": "¿Envían pan?", "a": "Todavía no — el pan de masa madre se disfruta mejor fresco, así que por ahora solo ofrecemos recogida local en el puesto de la granja o en el Mercado de Agricultores de Sylvan Ridge. Estamos explorando envíos regionales para el futuro."},
    {"q": "¿Con cuánta anticipación necesito pedir?", "a": "Pedimos al menos 48 horas de aviso. Los pedidos realizados después del miércoles por la noche pueden pasar al horneado de la semana siguiente, ya que solo horneamos lo reservado más un pequeño stock adicional."},
    {"q": "¿Cuáles son sus horarios y lugares de recogida?", "a": "El puesto de la granja está abierto viernes y sábado, 9am–1pm, en 412 Millbrook Hollow Rd. También tenemos una mesa en el Mercado de Agricultores de Sylvan Ridge los sábados. Elegirás uno al hacer tu pedido."},
    {"q": "¿Su pan se hace con levadura comercial?", "a": "No. Cada pan se leuda únicamente con nuestro fermento salvaje, que se ha mantenido desde 2016. Ningún pan lleva levadura comercial, acondicionadores de masa ni conservantes."},
    {"q": "¿Ofrecen pan sin gluten?", "a": "Actualmente no. Todo nuestro pan se hace con harina de trigo y/o centeno, por lo que no es adecuado para dietas sin gluten o celíacas."},
    {"q": "¿Qué alérgenos debo tener en cuenta?", "a": "Todos los panes contienen trigo. Algunos contienen lácteos, miel o frutos secos/semillas (consulta la página del Menú para más detalles de cada artículo). Avísanos de cualquier alergia en el campo de notas al pedir y lo marcaremos antes de hornear."},
    {"q": "¿Cómo debo guardar y refrescar mi pan?", "a": "Guárdalo con el corte hacia abajo a temperatura ambiente en una bolsa de papel o de pan hasta por 4 días, o congélalo entero o en rebanadas hasta por 3 meses. Unos minutos en un horno caliente devuelven esa corteza recién horneada."},
    {"q": "¿Hacen pedidos personalizados, de boda o al por mayor?", "a": "¡Sí! Escríbenos por la página de Contacto con la fecha de tu evento, cantidades y cualquier solicitud especial, y te diremos qué es posible según el horneado de esa semana."},
]

HISTORY_TIMELINE_EN = [
    {"year": "2016", "title": "A starter is born", "text": "It began with a jar of flour and water on a kitchen counter and a lot of failed loaves. Within a few months, that same starter was feeding our whole family — it's still the one we bake with today."},
    {"year": "2018", "title": "First farmers market stand", "text": "We showed up to the Sylvan Ridge farmers market with twelve loaves and a folding table. They sold out in under an hour."},
    {"year": "2020", "title": "We moved the bakery to the farm", "text": "A wood-fired oven went up behind the barn, and baking day became a weekly rhythm tied to the seasons and what was growing in the fields around it."},
    {"year": "2022", "title": "Community-supported bakery launched", "text": "Neighbors could finally reserve a standing weekly loaf, and Forest Haven Farm started feeling less like a side project and more like a real bakery."},
    {"year": "2024", "title": "Real Sourdough Bread finds its community online", "text": "Our Instagram, @foresthavenfarm, became a weekly window into the starter, the fields, and the oven — and brought a whole new community of bread lovers to the farm stand."},
    {"year": "2026", "title": "Online ordering opens", "text": "This site launches so anyone can browse the menu, learn the process, and reserve a loaf ahead of baking day — no more guessing if we sold out."},
]
HISTORY_TIMELINE_ES = [
    {"year": "2016", "title": "Nace un fermento", "text": "Comenzó con un frasco de harina y agua en la encimera de la cocina y muchos panes fallidos. En pocos meses, ese mismo fermento alimentaba a toda nuestra familia — es el mismo con el que horneamos hoy."},
    {"year": "2018", "title": "Primer puesto en el mercado de agricultores", "text": "Llegamos al mercado de agricultores de Sylvan Ridge con doce panes y una mesa plegable. Se agotaron en menos de una hora."},
    {"year": "2020", "title": "Trasladamos la panadería a la granja", "text": "Se construyó un horno de leña detrás del granero, y el día de horneado se convirtió en un ritmo semanal ligado a las estaciones y a lo que crecía en los campos alrededor."},
    {"year": "2022", "title": "Se lanzó la panadería con apoyo comunitario", "text": "Los vecinos por fin podían reservar un pan semanal fijo, y Forest Haven Farm empezó a sentirse menos como un proyecto secundario y más como una panadería de verdad."},
    {"year": "2024", "title": "Real Sourdough Bread encuentra su comunidad en línea", "text": "Nuestro Instagram, @foresthavenfarm, se convirtió en una ventana semanal al fermento, los campos y el horno — y trajo toda una nueva comunidad de amantes del pan al puesto de la granja."},
    {"year": "2026", "title": "Se abren los pedidos en línea", "text": "Este sitio se lanza para que cualquiera pueda explorar el menú, conocer el proceso y reservar un pan antes del día de horneado — sin más adivinar si ya se agotó."},
]

PROCESS_STEPS_EN = [
    {"title": "Feed the starter", "meta": "Every morning", "text": "Our starter has been fed daily for over ten years. It's the only leavening agent in any Forest Haven loaf — no commercial yeast, ever."},
    {"title": "Mix & autolyse", "meta": "Day 1, morning", "text": "Flour and water rest together before salt and starter are added, letting the grain hydrate fully for better structure and flavor."},
    {"title": "Bulk ferment", "meta": "Day 1, 18–24 hours", "text": "The dough rises slowly at a cool room temperature, with a series of gentle folds to build strength without overworking it."},
    {"title": "Shape", "meta": "Day 2, morning", "text": "Each loaf is hand-shaped and placed in a proofing basket to hold its form through the final rise."},
    {"title": "Cold proof overnight", "meta": "Day 2, overnight", "text": "A slow, cold proof in the walk-in develops deeper flavor and makes the dough easier to score cleanly."},
    {"title": "Score & bake", "meta": "Day 3, baking day", "text": "Loaves are scored by hand and baked in a steam-injected oven for a crackling crust and an open, airy crumb."},
    {"title": "Cool & deliver", "meta": "Day 3, afternoon", "text": "Bread rests until fully cooled before it's boxed for the farm stand, market table, or your pre-order pickup."},
]
PROCESS_STEPS_ES = [
    {"title": "Alimentar el fermento", "meta": "Cada mañana", "text": "Nuestro fermento se alimenta a diario desde hace más de diez años. Es el único agente leudante en cualquier pan de Forest Haven — nunca levadura comercial."},
    {"title": "Mezclar y autolizar", "meta": "Día 1, mañana", "text": "La harina y el agua reposan juntas antes de añadir la sal y el fermento, dejando que el grano se hidrate por completo para mejor estructura y sabor."},
    {"title": "Fermentación en bloque", "meta": "Día 1, 18–24 horas", "text": "La masa sube lentamente a temperatura ambiente fresca, con una serie de pliegues suaves para desarrollar fuerza sin trabajarla de más."},
    {"title": "Formado", "meta": "Día 2, mañana", "text": "Cada pan se forma a mano y se coloca en una canasta de fermentación para mantener su forma durante el último levado."},
    {"title": "Fermentación fría nocturna", "meta": "Día 2, durante la noche", "text": "Una fermentación fría y lenta en el refrigerador desarrolla más sabor y facilita marcar la masa con cortes limpios."},
    {"title": "Marcado y horneado", "meta": "Día 3, día de horneado", "text": "Los panes se marcan a mano y se hornean en un horno con inyección de vapor para lograr una corteza crujiente y una miga aireada."},
    {"title": "Enfriado y entrega", "meta": "Día 3, tarde", "text": "El pan reposa hasta enfriarse por completo antes de empacarse para el puesto de la granja, la mesa del mercado o la recogida de tu pedido."},
]

GALLERY_TILES_EN = [
    {"feature": True, "tag": "Reel", "label": "The Big Reveal — fresh-scored boule", "videoSrc": "/assets/video/loaf-reveal.mp4", "poster": "/assets/photos/reel-video-poster-thumb.jpg"},
    {"tag": "Post", "label": "Golden Crust, Fresh Cut", "src": "/assets/photos/boule-detail-thumb.jpg", "alt": "Close-up of a hand-scored sourdough boule crust"},
    {"tag": "Post", "label": "Weekend Mini Boules", "src": "/assets/photos/mini-boules-thumb.jpg", "alt": "Four small sourdough boules cooling on a wooden rack"},
    {"tag": "Post", "label": "Sesame Rolls, Fresh Batch", "src": "/assets/photos/sesame-rolls-thumb.jpg", "alt": "Four sesame-topped sourdough rolls"},
]
GALLERY_TILES_ES = [
    {"feature": True, "tag": "Video", "label": "El Gran Momento — boule recién marcado", "videoSrc": "/assets/video/loaf-reveal.mp4", "poster": "/assets/photos/reel-video-poster-thumb.jpg"},
    {"tag": "Publicación", "label": "Corteza Dorada, Corte Fresco", "src": "/assets/photos/boule-detail-thumb.jpg", "alt": "Primer plano de la corteza de un boule de masa madre marcado a mano"},
    {"tag": "Publicación", "label": "Mini Boules del Fin de Semana", "src": "/assets/photos/mini-boules-thumb.jpg", "alt": "Cuatro pequeños boules de masa madre enfriándose en una rejilla de madera"},
    {"tag": "Publicación", "label": "Panecillos de Sésamo, Lote Fresco", "src": "/assets/photos/sesame-rolls-thumb.jpg", "alt": "Cuatro panecillos de masa madre cubiertos con sésamo"},
]

SETTINGS_DEFAULT = {
    "businessName": "Forest Haven Farm",
    "tagline": "Real Sourdough Bread",
    "address": "412 Millbrook Hollow Rd",
    "cityStateZip": "Sylvan Ridge, VT 05450",
    "phone": "(802) 555-0142",
    "phoneHref": "+18025550142",
    "email": "hello@foresthavenfarm.com",
    "hoursShort": "Fri & Sat, 9am – 1pm",
    "instagramUrl": "https://www.instagram.com/foresthavenfarm/",
    "facebookUrl": "",
}

# Maps a content key to its per-language defaults, or None for
# language-independent keys (handled separately below).
DEFAULTS_BY_KEY = {
    "strings": {"en": STRINGS_EN, "es": STRINGS_ES},
    "menu_items": {"en": MENU_ITEMS_EN, "es": MENU_ITEMS_ES},
    "menu_filters": {"en": MENU_FILTERS_EN, "es": MENU_FILTERS_ES},
    "faq_items": {"en": FAQ_ITEMS_EN, "es": FAQ_ITEMS_ES},
    "history_timeline": {"en": HISTORY_TIMELINE_EN, "es": HISTORY_TIMELINE_ES},
    "process_steps": {"en": PROCESS_STEPS_EN, "es": PROCESS_STEPS_ES},
    "gallery_tiles": {"en": GALLERY_TILES_EN, "es": GALLERY_TILES_ES},
}

# Operational parameters — admin-editable in the "Parameters" panel. Drives
# order-notification routing and the pickup-date / capacity rules. Weekdays are
# Python's Monday=0 … Sunday=6.
PARAMETERS_DEFAULT = {
    "orderNotifyEmail": "epforest@yahoo.com",
    "orderCutoffDays": 3,
    "rollingWeeksAhead": 8,
    "pickupDays": [
        {"weekday": 0, "maxBreads": 20},
        {"weekday": 2, "maxBreads": 20},
    ],
}

# Language-independent keys: {key: default_value}
DEFAULTS_LANG_INDEPENDENT = {
    "settings": SETTINGS_DEFAULT,
    "parameters": PARAMETERS_DEFAULT,
}
