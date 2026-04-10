import { Box, Typography, IconButton } from '@mui/material'
import { motion } from 'framer-motion'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import AssignmentIcon from '@mui/icons-material/Assignment'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { SOCIAL_LINKS } from '@lib/links'
import { COLORS, FONTS } from '@styles/theme'

const ICON_MAP = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: MusicNoteIcon,
  form: AssignmentIcon,
}

function LinkCard({ link, index }) {
  const Icon = ICON_MAP[link.icon]

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01 }}
    >
      <Box
        component="a"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: '18px 20px',
          background: COLORS.dark1,
          border: `1px solid ${COLORS.border}`,
          borderLeft: link.cta ? `3px solid ${link.color}` : `1px solid ${COLORS.border}`,
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: COLORS.dark2,
            borderColor: link.color,
            '& .link-arrow': { opacity: 1, transform: 'translateX(0)' },
            '& .link-glow': { opacity: 1 },
          },
        }}
      >
        {/* Hover glow */}
        <Box
          className="link-glow"
          sx={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0,
            background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${link.color}18, transparent)`,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '2px',
            background: `${link.color}18`,
            border: `1px solid ${link.color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icon && <Icon sx={{ color: link.color, fontSize: 22 }} />}
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: COLORS.white,
              lineHeight: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {link.label}
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              color: COLORS.muted,
              fontFamily: FONTS.condensed,
              letterSpacing: '0.08em',
            }}
          >
            {link.sublabel}
          </Typography>
        </Box>

        {/* Arrow */}
        <OpenInNewIcon
          className="link-arrow"
          sx={{
            color: COLORS.muted,
            fontSize: 16,
            opacity: 0.4,
            transform: 'translateX(-4px)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        />
      </Box>
    </motion.div>
  )
}

export default function SocialLinks() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        background: COLORS.black,
      }}
    >
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="overline"
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: '11px',
              letterSpacing: '0.4em',
              color: COLORS.muted,
              display: 'block',
              mb: 1,
            }}
          >
          </Typography>
          {/* Nuevo texto: Familia Motera / Comunidad */}
        <Typography
          sx={{
            fontFamily: FONTS.condensed,
            fontSize: { xs: '11px', sm: '13px' },
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.white,
            mb: 2, // Bajamos un poco el margen para el bloque de texto largo
            opacity: 0.9,
          }}
        >
          Únete a la familia motera — Comunidad raider
        </Typography>

        {/* Bloque de Información de Seguridad (Texto de la imagen) */}
        <Box 
          sx={{ 
            maxWidth: 500, 
            mx: 'auto', 
            mb: 4, 
            px: 2 
          }}
        >
          <Typography
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: { xs: '10px', sm: '11px' },
              lineHeight: 1.6,
              letterSpacing: '0.05em',
              textAlign: 'center',
              color: COLORS.muted, // Usamos muted para que sea informativo y no distraiga
              textTransform: 'uppercase',
            }}
          >
            Queremos informarte que por medio de este formulario podemos brindarte ayuda en caso de 
            emergencia o accidente. Es de vital importancia que te registres en nuestra base de datos 
            para contar con una <Box component="span" sx={{ color: COLORS.white }}>red de apoyo al instante</Box> ante cualquier 
            siniestro vial y gozar de beneficios con marcas aliadas.
            <br />
            <Box component="span" sx={{ fontSize: '9px', opacity: 0.6, mt: 1, display: 'block' }}>
              Sin mucho más que agregar...
            </Box>
          </Typography>
        </Box>

          <Typography
            component="h2"
            sx={{
              fontFamily: FONTS.display,
              fontSize: { xs: '36px', sm: '48px' },
              letterSpacing: '0.04em',
              color: COLORS.white,
              lineHeight: 1,
              mb: 4,
            }}
          >
            ÚNETE A LA <Box component="span" sx={{ color: COLORS.red }}>HERMANDAD</Box>
          </Typography>
        </motion.div>

        {/* Links list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', background: COLORS.border }}>
          {SOCIAL_LINKS.sort((a, b) => a.priority - b.priority).map((link, i) => (
            <LinkCard key={link.id} link={link} index={i} />
          ))}
        </Box>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              color: COLORS.muted,
              textAlign: 'center',
              mt: 3,
              fontFamily: FONTS.condensed,
              letterSpacing: '0.1em',
            }}
          >
          </Typography>
        </motion.div>
      </Box>
    </Box>
  )
}
