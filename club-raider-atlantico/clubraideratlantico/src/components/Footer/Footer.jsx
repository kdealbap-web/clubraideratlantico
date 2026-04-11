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
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${COLORS.yellow}, ${COLORS.red} 50%, ${COLORS.blue})` }} />

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: { xs: 4, md: 5 } }}>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, mb: 3 }}>
            <Box component="img" src="/logo.png" alt="logo"
              sx={{ width: 72, height: 'auto', filter: 'drop-shadow(0 0 16px rgba(204,34,34,0.3))' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <Box>
              {/* Título CLUB RAIDER ATLÁNTICO — rojo y blanco alternado */}
              <Typography sx={{ fontFamily: FONTS.display, fontSize: { xs: '26px', sm: '32px' }, letterSpacing: '0.06em', lineHeight: 1, mb: 0.5 }}>
                <Box component="span" sx={{ color: COLORS.red }}>C</Box>
                <Box component="span" sx={{ color: COLORS.white }}>L</Box>
                <Box component="span" sx={{ color: COLORS.red }}>U</Box>
                <Box component="span" sx={{ color: COLORS.white }}>B</Box>
                {' '}
                <Box component="span" sx={{ color: COLORS.red }}>R</Box>
                <Box component="span" sx={{ color: COLORS.white }}>A</Box>
                <Box component="span" sx={{ color: COLORS.red }}>I</Box>
                <Box component="span" sx={{ color: COLORS.white }}>D</Box>
                <Box component="span" sx={{ color: COLORS.red }}>E</Box>
                <Box component="span" sx={{ color: COLORS.white }}>R</Box>
                {' '}
                <Box component="span" sx={{ color: COLORS.red }}>A</Box>
                <Box component="span" sx={{ color: COLORS.white }}>T</Box>
                <Box component="span" sx={{ color: COLORS.red }}>L</Box>
                <Box component="span" sx={{ color: COLORS.white }}>Á</Box>
                <Box component="span" sx={{ color: COLORS.red }}>N</Box>
                <Box component="span" sx={{ color: COLORS.white }}>T</Box>
                <Box component="span" sx={{ color: COLORS.red }}>I</Box>
                <Box component="span" sx={{ color: COLORS.white }}>C</Box>
                <Box component="span" sx={{ color: COLORS.red }}>O</Box>
              </Typography>

              {/* Subtítulo Colombia tricolor */}
              <Typography sx={{ fontFamily: FONTS.condensed, fontSize: { xs: '10px', sm: '12px' }, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <Box component="span" sx={{ color: COLORS.red }}>PRIMER </Box>
                <Box component="span" sx={{ color: COLORS.white }}>CLUB </Box>
                <Box component="span" sx={{ color: COLORS.red }}>RAIDER </Box>
                <Box component="span" sx={{ color: COLORS.white }}>EN </Box>
                <Box component="span" sx={{ color: COLORS.yellow }}>COL</Box>
                <Box component="span" sx={{ color: COLORS.blue }}>OM</Box>
                <Box component="span" sx={{ color: COLORS.red }}>BIA</Box>
                <Box component="span" sx={{ color: COLORS.muted }}> · </Box>
                <Box component="span" sx={{ color: COLORS.red }}>ATL</Box>
                <Box component="span" sx={{ color: COLORS.white }}>ÁN</Box>
                <Box component="span" sx={{ color: COLORS.red }}>TICO</Box>
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <Divider sx={{ borderColor: COLORS.border, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: { xs: 'center', sm: 'space-between' }, gap: 2 }}>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography sx={{ fontSize: '12px', color: COLORS.muted, fontFamily: FONTS.condensed, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 0.5 }}>
              © {year} Club Raider Atlántico · Todos los derechos reservados
            </Typography>
            <Typography sx={{ fontSize: '11px', fontFamily: FONTS.condensed, letterSpacing: '0.08em', mt: 0.5 }}>
              <Box component="span" sx={{ color: COLORS.muted }}>Dev · </Box>
              <Box component="span" sx={{ color: '#FFD700', fontWeight: 600 }}>Kevin De Alba</Box>
              <Box component="span" sx={{ color: COLORS.muted }}> · </Box>
              <Box component="span" sx={{ color: '#C0C0C0', fontWeight: 600 }}>Alejandro Villanueva</Box>
              <Box component="span" sx={{ color: COLORS.muted }}> · </Box>
              <Box component="span" sx={{ color: COLORS.red, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Club Raider</Box>
              <Box component="span" sx={{ color: COLORS.white, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}> Dev's Team 🇨🇴</Box>
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