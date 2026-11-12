import { useEffect, useState } from 'react';

const decoded = new Set<string>();

function decode(url: string): Promise<void> {
  const image = new Image();
  image.src = url;
  const done = () => {
    decoded.add(url);
  };
  // decode() waits for the pixels, not just the bytes; a failure must not block the game.
  if (typeof image.decode !== 'function') {
    done();
    return Promise.resolve();
  }
  return image.decode().then(done, done);
}

/** True once every image is decoded. Images decoded earlier count at once: no loader flash. */
export function useImagesReady(urls: readonly string[]): boolean {
  const key = urls.join('\n');
  const [readyKey, setReadyKey] = useState<string | null>(() =>
    urls.every((url) => decoded.has(url)) ? key : null,
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all(key.split('\n').map(decode)).then(() => {
      if (!cancelled) setReadyKey(key);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return readyKey === key;
}
