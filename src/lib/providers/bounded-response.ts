/** Stop oversized/unexpected upstream bodies before buffering them. No provider details are logged. */
export async function boundedText(response: Response, maxBytes: number) {
  const length = response.headers.get("content-length");
  if (length && Number(length) > maxBytes)
    throw new Error("Provider response exceeds supported size.");
  if (!response.body) throw new Error("Provider response body is missing.");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let bytes = 0,
    text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes)
        throw new Error("Provider response exceeds supported size.");
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } catch (e) {
    await reader.cancel();
    throw e;
  } finally {
    reader.releaseLock();
  }
}
