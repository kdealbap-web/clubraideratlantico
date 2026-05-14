export const CLUB = {
  nombre: 'Club Raider Atlántico',
  ciudad: 'Barranquilla, Colombia',
  emails: {
    info: 'info@clubraideratlantico.com',
    admin: 'admin@clubraideratlantico.com',
  },
  web: 'https://clubraideratlantico.com',
  social: {
    instagram: {
      handle: '@clubraideratlantico',
      url: 'https://instagram.com/clubraideratlantico',
      label: 'Instagram',
    },
    tiktok: {
      handle: '@clubraideratlantico',
      url: 'https://tiktok.com/@clubraideratlantico',
      label: 'TikTok',
    },
    facebook: {
      handle: 'Club Raider Atlántico',
      url: 'https://facebook.com/clubraideratlantico',
      label: 'Facebook',
    },
    whatsapp: {
      handle: 'Grupo oficial',
      url: 'https://chat.whatsapp.com/IBTjlbhHJXSAgSovkokvr0',
      label: 'WhatsApp',
    },
  },
  paleta: {
    rojo: '#CC2222',
    amarillo: '#E8B800',
    azul: '#003DA5',
    negro: '#0A0A0A',
    blanco: '#F0EDE8',
  },
} as const;

export const STORAGE_KEYS = {
  theme: 'raider:theme',
  sidebar: 'raider:sidebar',
} as const;

export const ROUTES = {
  home: '/',
  nosotros: '/nosotros',
  reglamento: '/reglamento',
  eventos: '/eventos',
  galeria: '/galeria',
  noticias: '/noticias',
  unete: '/unete',
  login: '/login',
  signup: '/signup',
  admin: '/admin',
  adminMiembros: '/admin/miembros',
  adminEventos: '/admin/eventos',
  adminGaleria: '/admin/galeria',
  adminNoticias: '/admin/noticias',
  adminConfiguracion: '/admin/configuracion',
  adminCronograma: '/admin/cronograma',
  portal: '/portal',
} as const;
