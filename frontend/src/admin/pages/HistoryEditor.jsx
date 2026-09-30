import CollectionEditor from "../components/CollectionEditor";

const FIELDS = [
  { name: "year", label: "Year" },
  { name: "title", label: "Milestone Title" },
  { name: "text", label: "Description", type: "textarea" },
];

export default function HistoryEditor() {
  return (
    <CollectionEditor
      contentKey="history_timeline"
      title="History Timeline"
      description="The milestones shown on the History page."
      fields={FIELDS}
      blankItem={{ year: "", title: "", text: "" }}
      itemTitle={(item) => `${item.year || "—"} · ${item.title || "New milestone"}`}
      addLabel="Add Milestone"
    />
  );
}
