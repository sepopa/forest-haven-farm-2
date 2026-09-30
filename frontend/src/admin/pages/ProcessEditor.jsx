import CollectionEditor from "../components/CollectionEditor";

const FIELDS = [
  { name: "title", label: "Step Title" },
  { name: "meta", label: "Timing (e.g. \"Day 1, morning\")" },
  { name: "text", label: "Description", type: "textarea" },
];

export default function ProcessEditor() {
  return (
    <CollectionEditor
      contentKey="process_steps"
      title="Process Steps"
      description="The step-by-step baking process shown on the Process page, in order."
      fields={FIELDS}
      blankItem={{ title: "", meta: "", text: "" }}
      itemTitle={(item) => item.title || "New step"}
      addLabel="Add Step"
    />
  );
}
