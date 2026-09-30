import CollectionEditor from "../components/CollectionEditor";

const FILTER_FIELDS = [
  { name: "id", label: "Filter ID (used to match menu item categories, e.g. \"loaves\")" },
  { name: "label", label: "Label shown on the button" },
];

// Item ID and Tag aren't editable here — id is auto-generated from the name
// and tag is auto-filled from the chosen category's label (see
// withGeneratedIdsAndTags below), so there's nothing for an admin to fill in
// or get out of sync.
const ITEM_FIELDS = [
  { name: "name", label: "Name" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price", label: "Price (e.g. $9 or Market Price)" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: (content, lang) =>
      (content?.menu_filters?.[lang] || [])
        .filter((f) => f.id !== "all")
        .map((f) => ({ value: f.id, label: f.label })),
  },
  { name: "photo", label: "Photo", type: "image" },
];

const DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "") // strip accents (e.g. Jalapeño -> Jalapeno)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Fills in `id` (slugified from the name, deduped against the rest of the
// list) for any item that doesn't have one yet, and syncs `tag` to the
// label of whichever category is currently selected.
function withGeneratedIdsAndTags(items, filters) {
  const usedIds = new Set();
  return items.map((item) => {
    let id = item.id;
    if (!id) {
      const base = slugify(item.name) || "item";
      let candidate = base;
      let n = 2;
      while (usedIds.has(candidate)) {
        candidate = `${base}-${n}`;
        n += 1;
      }
      id = candidate;
    }
    usedIds.add(id);

    const matchedFilter = filters.find((f) => f.id === item.category);
    const tag = matchedFilter ? matchedFilter.label : item.tag;

    return { ...item, id, tag };
  });
}

export default function MenuEditor() {
  return (
    <>
      <CollectionEditor
        contentKey="menu_filters"
        title="Menu Filters"
        description="The filter buttons shown at the top of the Menu page. Add categories here first — they populate the Category dropdown below."
        fields={FILTER_FIELDS}
        blankItem={{ id: "", label: "" }}
        itemTitle={(item) => item.label || "New filter"}
        addLabel="Add Filter"
      />
      <CollectionEditor
        contentKey="menu_items"
        title="Menu Items"
        description="Every loaf, roll, or bake shown on the Menu page and in the Orders dropdown lives here."
        fields={ITEM_FIELDS}
        blankItem={{ id: "", name: "", description: "", price: "", category: "", tag: "", photo: "" }}
        itemTitle={(item) => item.name || "New item"}
        addLabel="Add Menu Item"
        transformBeforeSave={(items, lang, content) => withGeneratedIdsAndTags(items, content?.menu_filters?.[lang] || [])}
      />
    </>
  );
}
