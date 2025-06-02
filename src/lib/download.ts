
export function downloadTextFile(filename: string, text: string, mimeType: string = 'text/plain') {
  const element = document.createElement('a');
  const file = new Blob([text], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}
