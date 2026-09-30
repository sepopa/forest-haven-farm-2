const FAQ_ITEMS_BY_LANG = {
  en: [
    {
      q: "Do you ship bread?",
      a: "Not yet — sourdough travels best fresh, so right now we only offer local pickup at the farm stand or the Sylvan Ridge Farmers Market. We're exploring regional shipping for the future.",
    },
    {
      q: "How far in advance do I need to order?",
      a: "We ask for at least 48 hours' notice. Orders placed after Wednesday evening may roll into the following week's bake, since we only bake what's been reserved plus a small walk-in stock.",
    },
    {
      q: "What are your pickup times and locations?",
      a: "The farm stand is open Friday and Saturday, 9am–1pm, at 412 Millbrook Hollow Rd. We also have a table at the Sylvan Ridge Farmers Market on Saturdays. You'll choose one when you place your order.",
    },
    {
      q: "Is your bread made with commercial yeast?",
      a: "No. Every loaf is leavened only with our wild sourdough starter, which has been maintained since 2016. No commercial yeast, dough conditioners, or preservatives go into any loaf.",
    },
    {
      q: "Do you offer gluten-free bread?",
      a: "Not currently. All of our bread is made with wheat and/or rye flour, so it isn't suitable for gluten-free or celiac diets.",
    },
    {
      q: "What allergens should I know about?",
      a: "All loaves contain wheat. Some contain dairy, honey, or nuts/seeds (see the Menu page for details on each item). Let us know about any allergy in the notes field when you order and we'll flag it before baking.",
    },
    {
      q: "How should I store and refresh my loaf?",
      a: "Store cut-side down at room temperature in a paper or bread bag for up to 4 days, or freeze whole/sliced for up to 3 months. A few minutes in a hot oven brings back that fresh-baked crust.",
    },
    {
      q: "Do you do custom, wedding, or wholesale orders?",
      a: "We do! Reach out through the Contact page with your event date, quantities, and any special requests, and we'll let you know what's possible for that week's baking schedule.",
    },
  ],
  es: [
    {
      q: "¿Envían pan?",
      a: "Todavía no — el pan de masa madre se disfruta mejor fresco, así que por ahora solo ofrecemos recogida local en el puesto de la granja o en el Mercado de Agricultores de Sylvan Ridge. Estamos explorando envíos regionales para el futuro.",
    },
    {
      q: "¿Con cuánta anticipación necesito pedir?",
      a: "Pedimos al menos 48 horas de aviso. Los pedidos realizados después del miércoles por la noche pueden pasar al horneado de la semana siguiente, ya que solo horneamos lo reservado más un pequeño stock adicional.",
    },
    {
      q: "¿Cuáles son sus horarios y lugares de recogida?",
      a: "El puesto de la granja está abierto viernes y sábado, 9am–1pm, en 412 Millbrook Hollow Rd. También tenemos una mesa en el Mercado de Agricultores de Sylvan Ridge los sábados. Elegirás uno al hacer tu pedido.",
    },
    {
      q: "¿Su pan se hace con levadura comercial?",
      a: "No. Cada pan se leuda únicamente con nuestro fermento salvaje, que se ha mantenido desde 2016. Ningún pan lleva levadura comercial, acondicionadores de masa ni conservantes.",
    },
    {
      q: "¿Ofrecen pan sin gluten?",
      a: "Actualmente no. Todo nuestro pan se hace con harina de trigo y/o centeno, por lo que no es adecuado para dietas sin gluten o celíacas.",
    },
    {
      q: "¿Qué alérgenos debo tener en cuenta?",
      a: "Todos los panes contienen trigo. Algunos contienen lácteos, miel o frutos secos/semillas (consulta la página del Menú para más detalles de cada artículo). Avísanos de cualquier alergia en el campo de notas al pedir y lo marcaremos antes de hornear.",
    },
    {
      q: "¿Cómo debo guardar y refrescar mi pan?",
      a: "Guárdalo con el corte hacia abajo a temperatura ambiente en una bolsa de papel o de pan hasta por 4 días, o congélalo entero o en rebanadas hasta por 3 meses. Unos minutos en un horno caliente devuelven esa corteza recién horneada.",
    },
    {
      q: "¿Hacen pedidos personalizados, de boda o al por mayor?",
      a: "¡Sí! Escríbenos por la página de Contacto con la fecha de tu evento, cantidades y cualquier solicitud especial, y te diremos qué es posible según el horneado de esa semana.",
    },
  ],
};

export function getFaqItems(lang) {
  return FAQ_ITEMS_BY_LANG[lang] || FAQ_ITEMS_BY_LANG.en;
}
