export function ownsDocument<T extends { ownerUid?: string }>(doc: T | null | undefined, uid: unknown): doc is T {
  return typeof uid === 'string' && uid.length > 0 && !!doc && doc.ownerUid === uid;
}
