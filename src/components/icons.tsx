import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function makeIcon(path: JSX.Element) {
  return function Icon({ size = 18, ...rest }: IconProps) {
    return (
      <svg {...baseProps} width={size} height={size} {...rest}>
        {path}
      </svg>
    );
  };
}

export const IconDashboard = makeIcon(
  <>
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </>,
);

export const IconUsers = makeIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
    <circle cx="17" cy="6" r="2.5" />
    <path d="M16 13c2.5.3 5 2.4 5 5" />
  </>,
);

export const IconCalendar = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="16" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);

export const IconImage = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="16" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m21 16-5-5-9 9" />
  </>,
);

export const IconNews = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="16" />
    <path d="M7 9h10M7 13h10M7 17h6" />
  </>,
);

export const IconSettings = makeIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>,
);

export const IconSearch = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

export const IconBell = makeIcon(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
);

export const IconPlus = makeIcon(<path d="M12 5v14M5 12h14" />);
export const IconChevronRight = makeIcon(<path d="m9 6 6 6-6 6" />);
export const IconChevronDown = makeIcon(<path d="m6 9 6 6 6-6" />);
export const IconChevronLeft = makeIcon(<path d="m15 6-6 6 6 6" />);
export const IconChevronUp = makeIcon(<path d="m18 15-6-6-6 6" />);
export const IconMore = makeIcon(
  <>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>,
);
export const IconClose = makeIcon(<path d="M18 6 6 18M6 6l12 12" />);
export const IconCheck = makeIcon(<path d="m20 6-11 11-5-5" />);
export const IconEdit = makeIcon(<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />);
export const IconTrash = makeIcon(
  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
);
export const IconUpload = makeIcon(
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
);
export const IconDownload = makeIcon(
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
);
export const IconFilter = makeIcon(<path d="M22 3H2l8 9.46V19l4 2v-8.54z" />);
export const IconHelmet = makeIcon(
  <>
    <path d="M4 14a8 8 0 0 1 16 0v3H4z" />
    <path d="M9 14h11" />
    <path d="M4 17h16v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
  </>,
);
export const IconBike = makeIcon(
  <>
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 17.5h-5l-3-7h7l3 7M9 6h2l1.5 4M14 6h3l1 3" />
  </>,
);
export const IconRoute = makeIcon(
  <>
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M12 19h6.5a2.5 2.5 0 0 0 0-5H8a2.5 2.5 0 0 1 0-5H12" />
  </>,
);
export const IconQR = makeIcon(
  <>
    <rect x="3" y="3" width="6" height="6" />
    <rect x="15" y="3" width="6" height="6" />
    <rect x="3" y="15" width="6" height="6" />
    <path d="M15 15h3v3M21 15v6M15 21h3" />
  </>,
);
export const IconHome = makeIcon(<path d="m3 12 9-9 9 9v9a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2z" />);
export const IconLogout = makeIcon(
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
);
export const IconSun = makeIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>,
);
export const IconMoon = makeIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
);
export const IconMail = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" />
    <path d="m3 7 9 6 9-6" />
  </>,
);
export const IconWhatsApp = makeIcon(
  <>
    <path d="M21 12a9 9 0 1 1-3.6-7.2L21 3l-1.2 3.6A9 9 0 0 1 21 12z" />
    <path d="M8 12a4 4 0 0 0 4 4l2-2-2-1-1 1a2 2 0 0 1-2-2l1-1-1-2z" />
  </>,
);
export const IconInstagram = makeIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".5" />
  </>,
);
export const IconFacebook = makeIcon(
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
);
export const IconTikTok = makeIcon(
  <path d="M19 8.5a5.5 5.5 0 0 1-3-.93V15a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V3h2.5a4 4 0 0 0 3.5 3.5z" />,
);
export const IconChecklist = makeIcon(
  <>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" />
  </>,
);
