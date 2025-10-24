export const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png'] as const;

export const IMAGE_MIME_REGEX = new RegExp(
  `/(${ALLOWED_IMAGE_TYPES.join('|')})$`,
);
