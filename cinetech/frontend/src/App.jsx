// Styles spécifiques à l'app
import './App.css'
// Routing applicatif
import { Routes, Route } from 'react-router-dom'
// UI globale: barre de navigation + modale de recherche
import Navbar from './components/Navbar'
import SearchModal from './components/SearchModal'
import Home from './pages/Home'
import Series from './pages/Series'
import Films from './pages/Films'
import Nouveautes from './pages/Nouveautes'
import MovieDetails from './pages/MovieDetails'
import SeriesDetails from './pages/SeriesDetails'
import Favorites from './pages/Favorites'
import Search from './pages/Search'
// Contexte pour orchestrer la recherche (ouverture modale, requêtes)
import { SearchProvider } from './context/SearchContext'

// Définition des routes principales et layout global
function App() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <SearchProvider>
        <Navbar />
        <SearchModal />
        <main className="flex w-full flex-1 flex-col px-6 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/series" element={<Series />} />
            <Route path="/films" element={<Films />} />
            <Route path="/films/:slug" element={<MovieDetails />} />
            <Route path="/nouveautes" element={<Nouveautes />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/series/:slug" element={<SeriesDetails />} />
            <Route path="/series/:id" element={<SeriesDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
      </SearchProvider>
    </div>
  )
}

export default App
