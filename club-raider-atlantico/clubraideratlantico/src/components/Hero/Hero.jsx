import { Box, Typography, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '@styles/theme'

// Framer Motion variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const logoVariant = {
  hidden: { opacity: 0, scale: 0.85, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

// Animated scan line effect on logo
const scanVariant = {
  animate: {
    y: ['0%', '100%', '0%'],
    transition: { duration: 3.5, ease: 'linear', repeat: Infinity, repeatDelay: 4 },
  },
}

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        py: 6,
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 80% 55% at 50% 65%, rgba(180,20,20,0.2) 0%, transparent 65%),
          radial-gradient(ellipse 50% 35% at 50% 100%, rgba(180,20,20,0.1) 0%, transparent 60%),
          ${COLORS.black}
        `,
      }}
    >
      {/* Scanline texture overlay */}
      <Box
        sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px
          )`,
        }}
      />

      {/* Radial vignette */}
      <Box
        sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}
      >
        {/* Logo with glow + scan line */}
        <motion.div variants={logoVariant}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: 200, sm: 260, md: 300 },
              mx: 'auto',
              mb: 3,
              filter: `drop-shadow(0 0 48px rgba(204,34,34,0.5))`,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Club Raider Atlántico"
              sx={{ width: '100%', height: 'auto', display: 'block' }}
            />
            {/* Scan line sweep */}
            <motion.div
              variants={scanVariant}
              animate="animate"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '20%',
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </motion.div>

        {/* Eyebrow */}
        <motion.div variants={fadeUp}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: { xs: '11px', sm: '13px' },
              letterSpacing: '0.4em',
              color: COLORS.red,
              display: 'block',
              mb: 1,
            }}
          >
            TVS Raider · Caribe Colombiano
          </Typography>
        </motion.div>

        {/* Main title */}
        <motion.div variants={fadeUp}>
          <Typography
            component="h1"
            sx={{
              fontFamily: FONTS.display,
              fontSize: { xs: '62px', sm: '88px', md: '110px' },
              lineHeight: 0.88,
              letterSpacing: '0.04em',
              color: COLORS.white,
              mb: 0.5,
            }}
          >
            BIENVENIDO
            <br />
            <Box component="span" sx={{ color: COLORS.red }}>
              RAIDERO
            </Box>
          </Typography>
        </motion.div>

        {/* Subtitle */}
        <motion.div variants={fadeUp}>
          <Typography
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: { xs: '16px', sm: '20px' },
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: COLORS.muted,
              mt: 1.5,
              mb: 3,
            }}
          >
            Club Raider Atlántico
          </Typography>
        </motion.div>

        {/* Status chip */}
        <motion.div variants={fadeUp}>
          <Chip
            label="● En construcción — la ruta ya comenzó"
            size="small"
            sx={{
              fontFamily: FONTS.condensed,
              fontSize: '12px',
              letterSpacing: '0.15em',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: 'rgba(204,34,34,0.12)',
              color: COLORS.red,
              border: `1px solid rgba(204,34,34,0.3)`,
              borderRadius: '2px',
              height: 28,
              animation: 'pulse 2.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.65 },
              },
            }}
          />
        </motion.div>
      </motion.div>
    </Box>
  )
}
