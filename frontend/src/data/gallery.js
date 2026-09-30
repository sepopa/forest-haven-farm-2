// Real photos/video from the Forest Haven kitchen. The first tile is a
// featured video (spans a 2x2 block via `feature: true` — see .tile-feature
// in style.css) so it reads like an actual Instagram Reel among stills.
// Add more objects here as new photos come in — no other code changes needed.
const GALLERY_TILES_BY_LANG = {
  en: [
    {
      feature: true,
      tag: "Reel",
      label: "The Big Reveal — fresh-scored boule",
      videoSrc: "/assets/video/loaf-reveal.mp4",
      poster: "/assets/photos/reel-video-poster-thumb.jpg",
    },
    {
      tag: "Post",
      label: "Golden Crust, Fresh Cut",
      src: "/assets/photos/boule-detail-thumb.jpg",
      alt: "Close-up of a hand-scored sourdough boule crust",
    },
    {
      tag: "Post",
      label: "Weekend Mini Boules",
      src: "/assets/photos/mini-boules-thumb.jpg",
      alt: "Four small sourdough boules cooling on a wooden rack",
    },
    {
      tag: "Post",
      label: "Sesame Rolls, Fresh Batch",
      src: "/assets/photos/sesame-rolls-thumb.jpg",
      alt: "Four sesame-topped sourdough rolls",
    },
  ],
  es: [
    {
      feature: true,
      tag: "Video",
      label: "El Gran Momento — boule recién marcado",
      videoSrc: "/assets/video/loaf-reveal.mp4",
      poster: "/assets/photos/reel-video-poster-thumb.jpg",
    },
    {
      tag: "Publicación",
      label: "Corteza Dorada, Corte Fresco",
      src: "/assets/photos/boule-detail-thumb.jpg",
      alt: "Primer plano de la corteza de un boule de masa madre marcado a mano",
    },
    {
      tag: "Publicación",
      label: "Mini Boules del Fin de Semana",
      src: "/assets/photos/mini-boules-thumb.jpg",
      alt: "Cuatro pequeños boules de masa madre enfriándose en una rejilla de madera",
    },
    {
      tag: "Publicación",
      label: "Panecillos de Sésamo, Lote Fresco",
      src: "/assets/photos/sesame-rolls-thumb.jpg",
      alt: "Cuatro panecillos de masa madre cubiertos con sésamo",
    },
  ],
};

export function getGalleryTiles(lang) {
  return GALLERY_TILES_BY_LANG[lang] || GALLERY_TILES_BY_LANG.en;
}
