/** An amount written next to a name: "(3)". One rule for every list that shows how many songs a name holds (#388). */
export function formatCount(n: number): string {
  return `(${n})`;
}
