import { useStore } from './store/appStore'
import LandingPage    from './pages/LandingPage'
import PricingPage    from './pages/PricingPage'
import CheckoutPage   from './pages/CheckoutPage'
import UploadPage     from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import AnalysisPage   from './pages/AnalysisPage'

export default function App() {
  const page = useStore(s => s.page)
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {page === 'landing'    && <LandingPage    />}
      {page === 'pricing'    && <PricingPage    />}
      {page === 'checkout'   && <CheckoutPage   />}
      {page === 'upload'     && <UploadPage     />}
      {page === 'processing' && <ProcessingPage />}
      {page === 'analysis'   && <AnalysisPage   />}
    </div>
  )
}
