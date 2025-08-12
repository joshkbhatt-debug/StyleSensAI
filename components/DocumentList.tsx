interface Doc {
  id: string;
  content: string;
  created_at: string;
}

interface DocumentListProps {
  docs: Doc[];
  onSelect: (doc: Doc) => void;
  onDelete: (id: string) => void;
}

/**
 * DocumentList displays a list of previously saved documents. Each item shows
 * a preview of the content (first 40 characters) and the creation date. The
 * user can open a document to continue editing or delete it. This component
 * is used on the /documents page.
 */
const DocumentList: React.FC<DocumentListProps> = ({ docs, onSelect, onDelete }) => {
  return (
    <ul className="space-y-2">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between rounded border border-gray-200 p-3"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-700">
              {doc.content.substring(0, 60) || 'Untitled document'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(doc.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelect(doc)}
              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              Open
            </button>
            <button
              onClick={() => onDelete(doc.id)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {docs.length === 0 && (
        <li className="text-center text-sm text-gray-500">You have no documents yet.</li>
      )}
    </ul>
  );
};

export default DocumentList;