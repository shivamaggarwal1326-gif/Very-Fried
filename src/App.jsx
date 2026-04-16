// src/App.jsx
import Dashboard from "./components/layout/Dashboard.jsx";
import KitchenCanvas from "./components/sketches/KitchenCanvas.jsx";

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