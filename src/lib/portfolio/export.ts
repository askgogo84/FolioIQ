/** CSV cells are quoted and spreadsheet formula prefixes neutralized. Unknown remains blank. */
export function csv(rows: unknown[][]): string {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let s = value === null || value === undefined ? "" : String(value);
            if (typeof value !== "number" && /^[\s]*[=+\-@]/.test(s))
              s = "'" + s;
            return '"' + s.replace(/"/g, '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
