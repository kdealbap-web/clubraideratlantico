export type ActivityKind =
  | 'member_approved'
  | 'member_rejected'
  | 'event_published'
  | 'gallery_uploaded'
  | 'news_published'
  | 'settings_updated';

export interface Activity {
  id: string;
  created_at: string;
  who: string;
  what: string;
  target: string | null;
  when: string;
  kind: ActivityKind;
}

export interface ChartPoint {
  mes: string;
  miembros: number;
  rodadas: number;
}
