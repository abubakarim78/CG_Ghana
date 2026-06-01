let counter = 1;

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(counter++).padStart(5, '0');
  return `CG-${year}-${seq}`;
}
