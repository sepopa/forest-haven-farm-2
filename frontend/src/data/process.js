const PROCESS_STEPS_BY_LANG = {
  en: [
    {
      title: "Feed the starter",
      meta: "Every morning",
      text: "Our starter has been fed daily for over ten years. It's the only leavening agent in any Forest Haven loaf — no commercial yeast, ever.",
    },
    {
      title: "Mix & autolyse",
      meta: "Day 1, morning",
      text: "Flour and water rest together before salt and starter are added, letting the grain hydrate fully for better structure and flavor.",
    },
    {
      title: "Bulk ferment",
      meta: "Day 1, 18–24 hours",
      text: "The dough rises slowly at a cool room temperature, with a series of gentle folds to build strength without overworking it.",
    },
    {
      title: "Shape",
      meta: "Day 2, morning",
      text: "Each loaf is hand-shaped and placed in a proofing basket to hold its form through the final rise.",
    },
    {
      title: "Cold proof overnight",
      meta: "Day 2, overnight",
      text: "A slow, cold proof in the walk-in develops deeper flavor and makes the dough easier to score cleanly.",
    },
    {
      title: "Score & bake",
      meta: "Day 3, baking day",
      text: "Loaves are scored by hand and baked in a steam-injected oven for a crackling crust and an open, airy crumb.",
    },
    {
      title: "Cool & deliver",
      meta: "Day 3, afternoon",
      text: "Bread rests until fully cooled before it's boxed for the farm stand, market table, or your pre-order pickup.",
    },
  ],
  es: [
    {
      title: "Alimentar el fermento",
      meta: "Cada mañana",
      text: "Nuestro fermento se alimenta a diario desde hace más de diez años. Es el único agente leudante en cualquier pan de Forest Haven — nunca levadura comercial.",
    },
    {
      title: "Mezclar y autolizar",
      meta: "Día 1, mañana",
      text: "La harina y el agua reposan juntas antes de añadir la sal y el fermento, dejando que el grano se hidrate por completo para mejor estructura y sabor.",
    },
    {
      title: "Fermentación en bloque",
      meta: "Día 1, 18–24 horas",
      text: "La masa sube lentamente a temperatura ambiente fresca, con una serie de pliegues suaves para desarrollar fuerza sin trabajarla de más.",
    },
    {
      title: "Formado",
      meta: "Día 2, mañana",
      text: "Cada pan se forma a mano y se coloca en una canasta de fermentación para mantener su forma durante el último levado.",
    },
    {
      title: "Fermentación fría nocturna",
      meta: "Día 2, durante la noche",
      text: "Una fermentación fría y lenta en el refrigerador desarrolla más sabor y facilita marcar la masa con cortes limpios.",
    },
    {
      title: "Marcado y horneado",
      meta: "Día 3, día de horneado",
      text: "Los panes se marcan a mano y se hornean en un horno con inyección de vapor para lograr una corteza crujiente y una miga aireada.",
    },
    {
      title: "Enfriado y entrega",
      meta: "Día 3, tarde",
      text: "El pan reposa hasta enfriarse por completo antes de empacarse para el puesto de la granja, la mesa del mercado o la recogida de tu pedido.",
    },
  ],
};

export function getProcessSteps(lang) {
  return PROCESS_STEPS_BY_LANG[lang] || PROCESS_STEPS_BY_LANG.en;
}
