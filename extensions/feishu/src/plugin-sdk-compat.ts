import { promises as fs } from "node:fs";
import path from "node:path";

// --- createDedupeCache (from src/infra/dedupe.ts) ---

export type DedupeCache = {
  check: (key: string | undefined | null, now?: number) => boolean;
  peek: (key: string | undefined | null, now?: number) => boolean;
  clear: () => void;
  size: () => number;
};

type DedupeCacheOptions = {
  ttlMs: number;
  maxSize: number;
};

export function createDedupeCache(options: DedupeCacheOptions): DedupeCache {
  const ttlMs = Math.max(0, options.ttlMs);
  const maxSize = Math.max(0, Math.floor(options.maxSize));
  const cache = new Map<string, number>();

  const touch = (key: string, now: number) => {
    cache.delete(key);
    cache.set(key, now);
  };

  const prune = (now: number) => {
    const cutoff = ttlMs > 0 ? now - ttlMs : undefined;
    if (cutoff !== undefined) {
      for (const [entryKey, entryTs] of cache) {
        if (entryTs < cutoff) {
          cache.delete(entryKey);
        }
      }
    }
    if (maxSize > 0) {
      while (cache.size > maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        } else {
          break;
        }
      }
    }
  };

  const hasUnexpired = (key: string, now: number, touchOnRead: boolean): boolean => {
    const existing = cache.get(key);
    if (existing === undefined) {
      return false;
    }
    if (ttlMs > 0 && now - existing >= ttlMs) {
      cache.delete(key);
      return false;
    }
    if (touchOnRead) {
      touch(key, now);
    }
    return true;
  };

  return {
    check: (key, now = Date.now()) => {
      if (!key) return false;
      if (hasUnexpired(key, now, true)) return true;
      touch(key, now);
      prune(now);
      return false;
    },
    peek: (key, now = Date.now()) => {
      if (!key) return false;
      return hasUnexpired(key, now, false);
    },
    clear: () => {
      cache.clear();
    },
    size: () => cache.size,
  };
}

// --- createPersistentDedupe (from src/plugin-sdk/persistent-dedupe.ts simplified) ---

export type PersistentDedupeOptions = {
  ttlMs: number;
  memoryMaxSize: number;
  fileMaxEntries: number;
  resolveFilePath: (namespace: string) => string;
  onDiskError?: (error: unknown) => void;
};

export type PersistentDedupeCheckOptions = {
  namespace?: string;
  now?: number;
  onDiskError?: (error: unknown) => void;
};

export type PersistentDedupe = {
  checkAndRecord: (key: string, options?: PersistentDedupeCheckOptions) => Promise<boolean>;
  clearMemory: () => void;
  memorySize: () => number;
};

export function createPersistentDedupe(options: PersistentDedupeOptions): PersistentDedupe {
  const ttlMs = Math.max(0, Math.floor(options.ttlMs));
  const memoryMaxSize = Math.max(0, Math.floor(options.memoryMaxSize));
  const fileMaxEntries = Math.max(1, Math.floor(options.fileMaxEntries));
  const memory = createDedupeCache({ ttlMs, maxSize: memoryMaxSize });
  const inflight = new Map<string, Promise<boolean>>();

  async function checkAndRecordInner(
    key: string,
    namespace: string,
    scopedKey: string,
    now: number,
    onDiskError?: (error: unknown) => void,
  ): Promise<boolean> {
    if (memory.check(scopedKey, now)) {
      return false;
    }

    const filePath = options.resolveFilePath(namespace);
    try {
      // Simplification: No file locking to avoid more missing dependencies
      let data: Record<string, number> = {};
      try {
        const content = await fs.readFile(filePath, "utf-8");
        data = JSON.parse(content);
      } catch {
        // Assume file doesn't exist or is invalid
      }

      const seenAt = data[key];
      const isRecent = seenAt != null && (ttlMs <= 0 || now - seenAt < ttlMs);
      if (isRecent) {
        return false;
      }

      data[key] = now;
      
      // Prune
      const keys = Object.keys(data);
      if (keys.length > fileMaxEntries) {
        keys.sort((a, b) => data[a] - data[b])
            .slice(0, keys.length - fileMaxEntries)
            .forEach(k => delete data[k]);
      }

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data), "utf-8");
      return true;
    } catch (error) {
      onDiskError?.(error);
      return true; // Fallback to allowing
    }
  }

  return {
    checkAndRecord: async (key, dedupeOptions) => {
      const trimmed = key.trim();
      if (!trimmed) return true;
      const namespace = dedupeOptions?.namespace?.trim() || "global";
      const scopedKey = `${namespace}:${trimmed}`;
      if (inflight.has(scopedKey)) return false;
      const now = dedupeOptions?.now ?? Date.now();
      const work = checkAndRecordInner(trimmed, namespace, scopedKey, now, dedupeOptions?.onDiskError ?? options.onDiskError);
      inflight.set(scopedKey, work);
      try {
        return await work;
      } finally {
        inflight.delete(scopedKey);
      }
    },
    clearMemory: () => memory.clear(),
    memorySize: () => memory.size(),
  };
}

// --- Status helpers ---

export function createDefaultChannelRuntimeState<T extends Record<string, unknown>>(
  accountId: string,
  extra?: T,
) {
  return {
    accountId,
    running: false,
    lastStartAt: null,
    lastStopAt: null,
    lastError: null,
    ...(extra ?? ({} as T)),
  };
}

export function buildBaseChannelStatusSummary(snapshot: any) {
  return {
    configured: snapshot.configured ?? false,
    running: snapshot.running ?? false,
    lastStartAt: snapshot.lastStartAt ?? null,
    lastStopAt: snapshot.lastStopAt ?? null,
    lastError: snapshot.lastError ?? null,
  };
}

export function normalizeAccountId(value: string | undefined | null): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "default";
  }
  return trimmed.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+/, "").replace(/-+$/, "").slice(0, 64) || "default";
}

export function feishuCreateScopedPairingAccess(params: {
  core: any;
  channel: string;
  accountId: string;
}) {
  const resolvedAccountId = normalizeAccountId(params.accountId);
  return {
    accountId: resolvedAccountId,
    readAllowFromStore: () =>
      params.core.channel.pairing.readAllowFromStore({
        channel: params.channel,
        accountId: resolvedAccountId,
      }),
    readStoreForDmPolicy: (provider: string, accountId: string) =>
      params.core.channel.pairing.readAllowFromStore({
        channel: provider,
        accountId: normalizeAccountId(accountId),
      }),
    upsertPairingRequest: (input: any) =>
      params.core.channel.pairing.upsertPairingRequest({
        channel: params.channel,
        accountId: resolvedAccountId,
        ...input,
      }),
  };
}

export function resolveRuntimeGroupPolicy(params: any) {
  const configuredFallbackPolicy = params.configuredFallbackPolicy ?? "open";
  const missingProviderFallbackPolicy = params.missingProviderFallbackPolicy ?? "allowlist";
  const groupPolicy = params.providerConfigPresent
    ? (params.groupPolicy ?? params.defaultGroupPolicy ?? configuredFallbackPolicy)
    : (params.groupPolicy ?? missingProviderFallbackPolicy);
  const providerMissingFallbackApplied =
    !params.providerConfigPresent && params.groupPolicy === undefined;
  return { groupPolicy, providerMissingFallbackApplied };
}

export function resolveDefaultGroupPolicy(cfg: any) {
  return cfg.channels?.defaults?.groupPolicy;
}

export function resolveOpenProviderRuntimeGroupPolicy(params: any) {
  return resolveRuntimeGroupPolicy({
    providerConfigPresent: params.providerConfigPresent,
    groupPolicy: params.groupPolicy,
    defaultGroupPolicy: params.defaultGroupPolicy,
    configuredFallbackPolicy: "open",
    missingProviderFallbackPolicy: "allowlist",
  });
}

export function resolveAllowlistProviderRuntimeGroupPolicy(params: any) {
  return resolveRuntimeGroupPolicy({
    providerConfigPresent: params.providerConfigPresent,
    groupPolicy: params.groupPolicy,
    defaultGroupPolicy: params.defaultGroupPolicy,
    configuredFallbackPolicy: "allowlist",
    missingProviderFallbackPolicy: "allowlist",
  });
}

const warnedMissingProviderGroupPolicy = new Set<string>();

export function warnMissingProviderGroupPolicyFallbackOnce(params: {
  providerMissingFallbackApplied: boolean;
  providerKey: string;
  accountId?: string;
  blockedLabel?: string;
  log: (message: string) => void;
}): boolean {
  if (!params.providerMissingFallbackApplied) {
    return false;
  }
  const key = `${params.providerKey}:${params.accountId ?? "*"}`;
  if (warnedMissingProviderGroupPolicy.has(key)) {
    return false;
  }
  warnedMissingProviderGroupPolicy.add(key);
  const blockedLabel = params.blockedLabel?.trim() || "group messages";
  params.log(
    `${params.providerKey}: channels.${params.providerKey} is missing; defaulting groupPolicy to "allowlist" (${blockedLabel} blocked until explicitly configured).`,
  );
  return true;
}

export function buildAgentMediaPayload(
  mediaList: Array<{ path: string; contentType?: string | null }>,
) {
  if (!mediaList || mediaList.length === 0) return {};
  const first = mediaList[0];
  const mediaPaths = mediaList.map((media) => media.path);
  const mediaTypes = mediaList.map((media) => media.contentType).filter(Boolean) as string[];
  return {
    MediaPath: first?.path,
    MediaType: first?.contentType ?? undefined,
    MediaUrl: first?.path,
    MediaPaths: mediaPaths.length > 0 ? mediaPaths : undefined,
    MediaUrls: mediaPaths.length > 0 ? mediaPaths : undefined,
    MediaTypes: mediaTypes.length > 0 ? mediaTypes : undefined,
  };
}

export async function withReplyDispatcher<T>(params: {
  dispatcher: any;
  run: () => Promise<T>;
  onSettled?: () => void | Promise<void>;
}): Promise<T> {
  try {
    return await params.run();
  } finally {
    // Ensure dispatcher reservations are always released on every exit path.
    if (typeof params.dispatcher.markComplete === "function") {
      params.dispatcher.markComplete();
    }
    try {
      if (typeof params.dispatcher.waitForIdle === "function") {
        await params.dispatcher.waitForIdle();
      }
    } finally {
      await params.onSettled?.();
    }
  }
}
