import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import Home       from './pages/Home'
import About      from './pages/About'
import Products   from './pages/Products'
import Membership from './pages/Membership'
import News       from './pages/News'
import Contact    from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index       element={<Home />} />
          <Route path="about"      element={<About />} />
          <Route path="products"   element={<Products />} />
          <Route path="membership" element={<Membership />} />
          <Route path="news"       element={<News />} />
          <Route path="contact"    element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
