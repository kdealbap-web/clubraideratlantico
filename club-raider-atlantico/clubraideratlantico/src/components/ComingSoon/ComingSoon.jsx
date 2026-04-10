import { Box, Typography, LinearProgress } from '@mui/material'
import { motion, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'
import { COLORS, FONTS } from '@styles/theme'

// Animated road dashes
function RoadDash({ delay }) {
  return (
    <motion.div
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: '110%', opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 32,
        height: 4,
        background: COLORS.yellow,
        borderRadius: 2,
      }}
    />
  )
}

// Animated motorcycle SVG
function MotoBike() {
  return (
    <motion.div
      animate={{ x: ['-2px', '2px', '-2px'], y: [0, '-2px', 0] }}
      transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rear wheel */}
        <circle cx="12" cy="30" r="9" stroke={COLORS.muted} strokeWidth="2.5" fill="none"/>
        <circle cx="12" cy="30" r="3" fill={COLORS.muted}/>
        {/* Front wheel */}
        <circle cx="52" cy="30" r="9" stroke={COLORS.muted} strokeWidth="2.5" fill="none"/>
        <circle cx="52" cy="30" r="3" fill={COLORS.muted}/>
        {/* Frame */}
        <path d="M12 30 L24 16 L38 16 L52 30" stroke={COLORS.light} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M24 16 L32 8 L44 14 L52 30" stroke={COLORS.white} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Engine/body */}
        <path d="M26 20 L38 20 L36 28 L20 28 Z" fill={COLORS.dark3} stroke={COLORS.border} strokeWidth="1"/>
        {/* Fairing accent */}
        <path d="M32 8 L44 14 L42 18 L36 16 Z" fill={COLORS.red} opacity="0.9"/>
        {/* Handlebar */}
        <line x1="44" y1="14" x2="48" y2="10" stroke={COLORS.light} strokeWidth="2" strokeLinecap="round"/>
        {/* Rider silhouette */}
        <ellipse cx="32" cy="12" rx="5" ry="5" fill={COLORS.dark2} stroke={COLORS.border} strokeWidth="1"/>
        <path d="M28 16 L36 16 L34 22 L30 22 Z" fill={COLORS.dark2}/>
        {/* Exhaust */}
        <motion.path
          d="M20 26 Q14 24 10 22"
          stroke={COLORS.muted}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.8, 0.2, 0.8], pathLength: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Speed lines */}
        <motion.g
          animate={{ x: [0, -8], opacity: [0.7, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
        >
          <line x1="4" y1="18" x2="14" y2="18" stroke={COLORS.red} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="2" y1="22" x2="10" y2="22" stroke={COLORS.red} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        </motion.g>
      </svg>
    </motion.div>
  )
}

const PHASES = [
  { label: 'Fase 0', name: 'Landing & Identidad', done: true },
  { label: 'Fase 1', name: 'Registro de Socios', done: false },
  { label: 'Fase 2', name: 'Portal del Piloto', done: false },
  { label: 'Fase 3', name: 'App Móvil', done: false },
]

export default function ComingSoon() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 6, md: 8 },
        px: 3,
        background: `linear-gradient(180deg, ${COLORS.black} 0%, ${COLORS.dark1} 100%)`,
        borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Section label */}
      <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
              mb: 2,
            }}
          >
            Estado del proyecto
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontFamily: FONTS.display,
              fontSize: { xs: '38px', sm: '52px' },
              letterSpacing: '0.04em',
              color: COLORS.white,
              lineHeight: 1,
              mb: 1,
            }}
          >
            LA RUTA YA <Box component="span" sx={{ color: COLORS.red }}>COMENZÓ</Box>
          </Typography>

          <Typography sx={{ fontSize: '14px', color: COLORS.muted, mb: 5, lineHeight: 1.7 }}>
            Plataforma en construcción activa. Mientras tanto, únete a nuestra comunidad.
          </Typography>
        </motion.div>

        {/* Road animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box
            sx={{
              position: 'relative',
              height: 56,
              background: COLORS.dark3,
              borderRadius: 0,
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              px: 3,
            }}
          >
            {/* Road stripes */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              {[0, 0.3, 0.6, 0.9, 1.2].map((d, i) => (
                <RoadDash key={i} delay={d} />
              ))}
            </Box>

            {/* Moto */}
            <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <MotoBike />
              <Typography
                sx={{
                  fontFamily: FONTS.condensed,
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: COLORS.light,
                }}
              >
                Construyendo a toda marcha
              </Typography>
            </Box>

            {/* Progress bar overlay */}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <LinearProgress
                variant="determinate"
                value={25}
                sx={{
                  height: 3,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.yellow})`,
                    borderRadius: 0,
                  },
                }}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Phase roadmap */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: '1px',
            background: COLORS.border,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Box
                sx={{
                  background: phase.done ? 'rgba(204,34,34,0.08)' : COLORS.dark1,
                  p: { xs: '16px 12px', md: '20px 16px' },
                  borderTop: phase.done ? `2px solid ${COLORS.red}` : `2px solid transparent`,
                  transition: 'background 0.2s',
                  '&:hover': { background: phase.done ? 'rgba(204,34,34,0.12)' : COLORS.dark2 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONTS.condensed,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: phase.done ? COLORS.red : COLORS.muted,
                    textTransform: 'uppercase',
                    mb: 0.5,
                  }}
                >
                  {phase.label} {phase.done ? '✓' : ''}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONTS.condensed,
                    fontSize: { xs: '13px', md: '14px' },
                    fontWeight: 600,
                    color: phase.done ? COLORS.white : COLORS.muted,
                  }}
                >
                  {phase.name}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
