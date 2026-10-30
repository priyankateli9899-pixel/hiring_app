/* Inline SVG icon library – no external deps required */
const I = ({ d, size = 18, stroke = 'currentColor', fill = 'none', strokeWidth = 2, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

export const HomeIcon       = (p) => <I {...p} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />;
export const BriefcaseIcon  = (p) => <I {...p} d={["M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z","M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"]} />;
export const StarIcon       = (p) => <I {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
export const FileTextIcon   = (p) => <I {...p} d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />;
export const CalendarIcon   = (p) => <I {...p} d={["M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z","M16 2v4","M8 2v4","M3 10h18"]} />;
export const ZapIcon        = (p) => <I {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
export const MessageIcon    = (p) => <I {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
export const TrendingUpIcon = (p) => <I {...p} d={["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"]} />;
export const BellIcon       = (p) => <I {...p} d={["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 01-3.46 0"]} />;
export const UserIcon       = (p) => <I {...p} d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 110 8 4 4 0 010-8z"]} />;
export const SettingsIcon   = (p) => <I {...p} d={["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"]} />;
export const LogoutIcon     = (p) => <I {...p} d={["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"]} />;
export const ChevronRightIcon=(p) => <I {...p} d="M9 18l6-6-6-6" />;
export const SearchIcon     = (p) => <I {...p} d={["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35"]} />;
export const MapPinIcon     = (p) => <I {...p} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 7a3 3 0 110 6 3 3 0 010-6z"]} />;
export const ClockIcon      = (p) => <I {...p} d={["M12 22a10 10 0 110-20 10 10 0 010 20z","M12 6v6l4 2"]} />;
export const CheckCircleIcon= (p) => <I {...p} d={["M22 11.08V12a10 10 0 11-5.93-9.14","M22 4L12 14.01l-3-3"]} />;
export const AlertIcon      = (p) => <I {...p} d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"]} />;
export const AwardIcon      = (p) => <I {...p} d={["M12 15a7 7 0 100-14 7 7 0 000 14z","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"]} />;
export const UploadIcon     = (p) => <I {...p} d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />;
export const GraduationIcon = (p) => <I {...p} d={["M22 10v6M2 10l10-5 10 5-10 5-10-5z","M6 12v5c3 3 9 3 12 0v-5"]} />;
export const MenuIcon       = (p) => <I {...p} d={["M3 12h18","M3 6h18","M3 18h18"]} />;
export const XIcon          = (p) => <I {...p} d={["M18 6L6 18","M6 6l12 12"]} />;
export const InfoIcon       = (p) => <I {...p} d={["M12 22a10 10 0 110-20 10 10 0 010 20z","M12 8h.01","M12 12v4"]} />;
export const ExternalLinkIcon=(p) => <I {...p} d={["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6","M15 3h6v6","M10 14L21 3"]} />;
