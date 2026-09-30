const TIMELINE_BY_LANG = {
  en: [
    {
      year: "2016",
      title: "A starter is born",
      text: "It began with a jar of flour and water on a kitchen counter and a lot of failed loaves. Within a few months, that same starter was feeding our whole family — it's still the one we bake with today.",
    },
    {
      year: "2018",
      title: "First farmers market stand",
      text: "We showed up to the Sylvan Ridge farmers market with twelve loaves and a folding table. They sold out in under an hour.",
    },
    {
      year: "2020",
      title: "We moved the bakery to the farm",
      text: "A wood-fired oven went up behind the barn, and baking day became a weekly rhythm tied to the seasons and what was growing in the fields around it.",
    },
    {
      year: "2022",
      title: "Community-supported bakery launched",
      text: "Neighbors could finally reserve a standing weekly loaf, and Forest Haven Farm started feeling less like a side project and more like a real bakery.",
    },
    {
      year: "2024",
      title: "Real Sourdough Bread finds its community online",
      text: "Our Instagram, @foresthavenfarm, became a weekly window into the starter, the fields, and the oven — and brought a whole new community of bread lovers to the farm stand.",
    },
    {
      year: "2026",
      title: "Online ordering opens",
      text: "This site launches so anyone can browse the menu, learn the process, and reserve a loaf ahead of baking day — no more guessing if we sold out.",
    },
  ],
  es: [
    {
      year: "2016",
      title: "Nace un fermento",
      text: "Comenzó con un frasco de harina y agua en la encimera de la cocina y muchos panes fallidos. En pocos meses, ese mismo fermento alimentaba a toda nuestra familia — es el mismo con el que horneamos hoy.",
    },
    {
      year: "2018",
      title: "Primer puesto en el mercado de agricultores",
      text: "Llegamos al mercado de agricultores de Sylvan Ridge con doce panes y una mesa plegable. Se agotaron en menos de una hora.",
    },
    {
      year: "2020",
      title: "Trasladamos la panadería a la granja",
      text: "Se construyó un horno de leña detrás del granero, y el día de horneado se convirtió en un ritmo semanal ligado a las estaciones y a lo que crecía en los campos alrededor.",
    },
    {
      year: "2022",
      title: "Se lanzó la panadería con apoyo comunitario",
      text: "Los vecinos por fin podían reservar un pan semanal fijo, y Forest Haven Farm empezó a sentirse menos como un proyecto secundario y más como una panadería de verdad.",
    },
    {
      year: "2024",
      title: "Real Sourdough Bread encuentra su comunidad en línea",
      text: "Nuestro Instagram, @foresthavenfarm, se convirtió en una ventana semanal al fermento, los campos y el horno — y trajo toda una nueva comunidad de amantes del pan al puesto de la granja.",
    },
    {
      year: "2026",
      title: "Se abren los pedidos en línea",
      text: "Este sitio se lanza para que cualquiera pueda explorar el menú, conocer el proceso y reservar un pan antes del día de horneado — sin más adivinar si ya se agotó.",
    },
  ],
};

export function getTimeline(lang) {
  return TIMELINE_BY_LANG[lang] || TIMELINE_BY_LANG.en;
}
