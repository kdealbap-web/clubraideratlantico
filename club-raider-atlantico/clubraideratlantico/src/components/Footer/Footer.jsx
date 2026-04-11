import { Box, Typography, IconButton, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { COLORS, FONTS } from '@styles/theme'
import { CLUB_INFO } from '@lib/links'

const SOCIAL_ICONS = [
  { id: 'whatsapp',  icon: WhatsAppIcon,  color: '#25D366', url: 'https://chat.whatsapp.com/IBTjlbhHJXSAgSovkokvr0' },
  { id: 'instagram', icon: InstagramIcon, color: '#E1306C', url: 'https://instagram.com/clubraideratl' },
  { id: 'tiktok',    icon: MusicNoteIcon, color: '#ffffff', url: 'https://www.tiktok.com/@club.raider.atl' },
  { id: 'facebook',  icon: FacebookIcon,  color: '#1877F2', url: 'https://www.facebook.com/share/1PXLn8kZVq/' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <Box component="footer" sx={{ background: COLORS.dark1, borderTop: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden' }}>
      {/* Tricolor Colombia */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${COLORS.yellow}, ${COLORS.red} 50%, ${COLORS.blue})` }} />

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: { xs: 4, md: 5 } }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
            <Box component="img" src="/logo.png" alt="logo"
              sx={{ width: 52, height: 'auto', filter: 'drop-shadow(0 0 12px rgba(204,34,34,0.3))' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <Box>
              <Typography sx={{ fontFamily: FONTS.display, fontSize: '20px', letterSpacing: '0.06em', color: COLORS.white, lineHeight: 1 }}>
                CLUB RAIDER <Box component="span" sx={{ color: COLORS.red }}>ATLÁNTICO</Box>
              </Typography>
              <Typography sx={{ fontFamily: FONTS.condensed, fontSize: '11px', letterSpacing: '0.25em', color: COLORS.muted, textTransform: 'uppercase' }}>
                {CLUB_INFO.tagline} · Barranquilla, Colombia 🇨🇴
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <Divider sx={{ borderColor: COLORS.border, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
  <Box>
    <Typography sx={{ fontSize: '12px', color: COLORS.muted, fontFamily: FONTS.condensed, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      © {year} Club Raider Atlántico · Hecho con
      <FavoriteIcon sx={{ fontSize: 11, color: COLORS.red, mx: 0.3 }} />
      en el Caribe
    </Typography>
    <Typography sx={{ fontSize: '11px', color: COLORS.muted, fontFamily: FONTS.condensed, letterSpacing: '0.08em', mt: 0.5 }}>
      Diseñado y desarrollado por{' '}
      <Box component="span" sx={{ color: COLORS.light, fontWeight: 600 }}>Kevin De Alba & Alejo Villanueva</Box>
      {' '}— Fullstack Dev Team · Barranquilla 🇨🇴
    </Typography>
  </Box>

  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {SOCIAL_ICONS.map(({ id, icon: Icon, color, url }) => (
      <IconButton key={id} component="a" href={url} target="_blank" rel="noopener noreferrer" size="small"
        sx={{
          color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: '2px', width: 32, height: 32,
          transition: 'all 0.2s',
          '&:hover': { color, borderColor: color, background: `${color}12` },
        }}>
        <Icon sx={{ fontSize: 16 }} />
      </IconButton>
    ))}
  </Box>

  <Typography sx={{ fontSize: '11px', color: COLORS.muted, fontFamily: FONTS.condensed, letterSpacing: '0.2em', textTransform: 'uppercase', border: `1px solid ${COLORS.border}`, px: 1.5, py: 0.5 }}>
    TVS Raider
  </Typography>
</Box>
      </Box>
    </Box>
  )
}