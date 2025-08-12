export async function requestWithTimeout(input: RequestInfo, init: RequestInit = {}, ms = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function withTimeout<T>(p: Promise<T>, ms = 30000) {
  let t: NodeJS.Timeout;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error('Timeout')), ms);
  });
  const out = await Promise.race([p, timeout]);
  clearTimeout(t!);
  return out as T;
} 