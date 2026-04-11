import { Box, Typography, LinearProgress } from '@mui/material'
import { motion, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'
import { COLORS, FONTS } from '@styles/theme'
import motoImg from '@assets/tvs-raider.png'

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
  // h=80px | rines medidos con Python desde imagen 500x333
  // Trasero:   elipse left=32 top=36 w=9  h=16
  // Delantero: elipse left=70 top=41 w=17 h=20
  // bottom=-18px compensa el espacio negro bajo la moto en la imagen
  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <style>{`
        @keyframes moto-drive {
          from { left: -420px; }
          to   { left: calc(100% + 220px); }
        }
        @keyframes moto-bounce {
          from { transform: translateY(0px) rotate(-0.2deg); }
          to   { transform: translateY(-2px) rotate(0.2deg); }
        }
        @keyframes wspin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes led-blink {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.5); }
        }
      `}</style>

      <Box sx={{
        position: 'absolute',
        bottom: '-40px',              // ← compensa espacio negro debajo
        animation: 'moto-drive 7.4s linear infinite',
      }}>
        <Box sx={{ position: 'relative', animation: 'moto-bounce 0.44s ease-in-out infinite alternate' }}>

          {/* Rin trasero — elipse pequeña */}
          <Box sx={{
            position: 'absolute', left: '32px', top: '36px',
            width: '14px', height: '14px', borderRadius: '50%',
            animation: 'wspin 0.35s linear infinite',
            boxShadow: '0 0 0 1.5px rgba(220,30,30,0.95), 0 0 6px rgba(255,30,30,0.5)',
          }}/>

          {/* Rin delantero — elipse más grande */}
          <Box sx={{
            position: 'absolute', left: '70px', top: '44px',
            width: '17px', height: '17px', borderRadius: '50%',
            animation: 'wspin 0.35s linear infinite',
            boxShadow: '0 0 0 1.5px rgba(220,30,30,0.95), 0 0 6px rgba(255,30,30,0.5)',
          }}/>


{/* Faro LED */}
<Box sx={{
  position: 'absolute', left: '76px', top: '25px',
  width: '3px', height: '3px', background: '#fff',
  borderRadius: '50%', filter: 'blur(2px)',
  animation: 'led-blink 0.65s ease-in-out infinite alternate',
  boxShadow: '0 0 4px rgba(255,255,255,0.8)',
}}/>
          <Box
            component="img"
            src={motoImg}
            alt="TVS Raider"
            sx={{
              height: 80,
              width: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 8px rgba(255,35,35,0.4))',
            }}
          />
        </Box>
      </Box>
    </Box>
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
              px: 6,
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
