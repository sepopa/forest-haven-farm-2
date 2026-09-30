import CollectionEditor from "../components/CollectionEditor";

const FIELDS = [
  { name: "tag", label: "Tag (e.g. \"Post\" or \"Reel\")" },
  { name: "label", label: "Caption" },
  { name: "feature", label: "Feature this tile (larger, video tile)", type: "checkbox" },
  { name: "src", label: "Photo (for a Post tile)", type: "image" },
  { name: "alt", label: "Photo alt text" },
  { name: "videoSrc", label: "Video (for a featured Reel tile)", type: "video" },
  { name: "poster", label: "Video poster image", type: "image" },
];

export default function GalleryEditor() {
  return (
    <CollectionEditor
      contentKey="gallery_tiles"
      title="Home Page Gallery"
      description={'The "From the Farm & Oven" photo/video grid on the Home page.'}
      fields={FIELDS}
      blankItem={{ tag: "", label: "", feature: false, src: "", alt: "", videoSrc: "", poster: "" }}
      itemTitle={(item) => item.label || "New tile"}
      addLabel="Add Tile"
    />
  );
}
