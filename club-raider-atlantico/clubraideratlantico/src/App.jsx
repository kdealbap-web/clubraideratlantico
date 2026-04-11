import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from '@styles/theme'
import Layout from '@components/Layout/Layout'
import Hero from '@components/Hero/Hero'
import ComingSoon from '@components/ComingSoon/ComingSoon'
import SocialLinks from '@components/SocialLinks/SocialLinks'
import Footer from '@components/Footer/Footer'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Hero />
        <SocialLinks />
        <ComingSoon />

      </Layout>
      <Footer />

    </ThemeProvider>
  )
}
