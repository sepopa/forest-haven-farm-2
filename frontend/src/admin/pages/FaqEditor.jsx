import CollectionEditor from "../components/CollectionEditor";

const FIELDS = [
  { name: "q", label: "Question" },
  { name: "a", label: "Answer", type: "textarea" },
];

export default function FaqEditor() {
  return (
    <CollectionEditor
      contentKey="faq_items"
      title="FAQ"
      description="Questions and answers shown on the FAQ page, in display order."
      fields={FIELDS}
      blankItem={{ q: "", a: "" }}
      itemTitle={(item) => item.q || "New question"}
      addLabel="Add Question"
    />
  );
}
