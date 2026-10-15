export default function Pagination({
  page,
  total,
  size = 50,
  onChange,
  label,
}: {
  page: number;
  total: number;
  size?: number;
  onChange: (page: number) => void;
  label: string;
}) {
  if (total <= size) return null;
  return (
    <nav className="trust-actions" aria-label={label + " pages"}>
      <button onClick={() => onChange(page - 1)} disabled={page === 0}>
        Previous
      </button>
      <span role="status">
        {page * size + 1}–{Math.min((page + 1) * size, total)} of {total}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={(page + 1) * size >= total}
      >
        Next
      </button>
    </nav>
  );
}
