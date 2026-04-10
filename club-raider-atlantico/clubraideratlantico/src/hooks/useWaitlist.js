import { useState } from 'react'
import { supabase } from '@lib/supabase'

/**
 * useWaitlist — Hook para gestionar la lista de espera (Fase 1)
 *
 * Uso:
 *   const { submit, loading, success, error } = useWaitlist()
 *   await submit({ email: 'piloto@example.com', name: 'Juan', whatsapp: '+573001234567' })
 */
export function useWaitlist() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const submit = async ({ email, name, whatsapp }) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: sbError } = await supabase
        .from('waitlist')
        .insert([{ email: email.toLowerCase().trim(), name, whatsapp }])

      if (sbError) {
        if (sbError.code === '23505') {
          setError('Este correo ya está registrado. ¡Gracias por tu interés!')
        } else {
          setError('Ocurrió un error. Inténtalo de nuevo.')
          console.error('[useWaitlist]', sbError)
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.')
      console.error('[useWaitlist]', err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSuccess(false)
    setError(null)
  }

  return { submit, loading, success, error, reset }
}
