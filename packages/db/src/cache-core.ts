const JSON_PREFIX = 0;
const BYTES_PREFIX = 1;

export const DEFAULT_TTL_SECONDS = 60;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const concatBytes = (chunks: Uint8Array[]): Uint8Array => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

export const encodeValue = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) {
    return concatBytes([new Uint8Array([BYTES_PREFIX]), value]);
  }

  const json = JSON.stringify(value);
  const body = encoder.encode(json);
  return concatBytes([new Uint8Array([JSON_PREFIX]), body]);
};

export const decodeValue = (value: Uint8Array): unknown => {
  if (value.length === 0) {
    return null;
  }

  const prefix = value[0] ?? JSON_PREFIX;
  const body = value.subarray(1);

  if (prefix === BYTES_PREFIX) {
    return body;
  }

  try {
    return JSON.parse(decoder.decode(body));
  } catch {
    return null;
  }
};
