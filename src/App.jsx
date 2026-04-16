// src/App.jsx
import Dashboard from './components/layout/Dashboard'
import KitchenCanvas from './components/sketches/KitchenCanvas'

function App() {
  return (
    <KitchenCanvas>
      <main className="p-6">
        <Dashboard />
      </main>
    </KitchenCanvas>
  )
}

export default App