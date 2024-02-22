/**
* Splits text into sentences, keeping punctuation with each sentence.
*
* @param {string} text - The input text.
*
* @returns {Promise<string>[]} - An array of Promises, each resolving to a sentence.
*/
export function splitText(text: string): Promise<string>[] {

  const sentences = text.split(/(?<=[.!?])(?=\s+)/);

  // Handle a potential trailing space in the last sentence 
  if (sentences.length > 0) {
      sentences[sentences.length - 1] = sentences[sentences.length - 1].trimEnd();
  }

  // Return the sentences as Promises to simulate an asynchronous operation
  // each Promise resolves to a sentence and is resolved in the order of the sentences
  // Also, it takes a random amount of time to resolve each Promise to simulate a real-world scenario

  return sentences.map((sentence) => {
    const delay = Math.floor(Math.random() * 1000) + 1;
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(sentence);
      }, delay);
    });
  })
}
