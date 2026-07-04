export interface AvatarPreset {
  id: string;
  label: string;
  src: string;
}

function createAvatarDataUri(background: string, accent: string, mark: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="24" fill="${background}"/>
      <circle cx="68" cy="24" r="16" fill="${accent}" opacity="0.9"/>
      <circle cx="30" cy="38" r="18" fill="white" opacity="0.92"/>
      <path d="${mark}" fill="${accent}"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const avatarPresets: AvatarPreset[] = [
  {
    id: 'blue-code',
    label: 'Blue Code',
    src: createAvatarDataUri('#2563eb', '#1e293b', 'M46 66 30 50l16-16 5 5-11 11 11 11-5 5Zm14 0-5-5 11-11-11-11 5-5 16 16-16 16Z')
  },
  {
    id: 'emerald-build',
    label: 'Emerald Build',
    src: createAvatarDataUri('#059669', '#064e3b', 'M29 64h38v8H29v-8Zm5-38h28l8 16H26l8-16Zm-8 22h44v8H26v-8Z')
  },
  {
    id: 'violet-ai',
    label: 'Violet AI',
    src: createAvatarDataUri('#7c3aed', '#312e81', 'M48 25 55 42l18 2-14 12 4 18-15-9-15 9 4-18-14-12 18-2 7-17Z')
  },
  {
    id: 'amber-cloud',
    label: 'Amber Cloud',
    src: createAvatarDataUri('#d97706', '#78350f', 'M34 62h30a13 13 0 0 0 0-26 18 18 0 0 0-34-4 15 15 0 0 0 4 30Z')
  },
  {
    id: 'rose-design',
    label: 'Rose Design',
    src: createAvatarDataUri('#e11d48', '#881337', 'M48 24c14 0 24 10 24 24S62 72 48 72 24 62 24 48s10-24 24-24Zm0 12a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z')
  }
];

export function getAvatarPreset(avatarId?: string) {
  return avatarPresets.find((avatar) => avatar.id === avatarId) || avatarPresets[0];
}
