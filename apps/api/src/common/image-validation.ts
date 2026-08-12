// Mirrors MAX_AVATAR_IMAGE_CHARS / MAX_REFLECTION_IMAGE_CHARS / IMAGE_VALUE_PATTERN in
// packages/shared/src/helpers.ts. Kept local (not imported from @merror/shared) because the API's
// tsc build has rootDir locked to ./src and can't emit a sibling package's raw .ts source — if
// these values change, update both places.
export const MAX_AVATAR_IMAGE_CHARS = 700_000; // ~500KB binary after base64 overhead
export const MAX_REFLECTION_IMAGE_CHARS = 1_800_000; // ~1.3MB binary after base64 overhead
export const IMAGE_VALUE_PATTERN = /^(https?:\/\/\S+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*)$/;
