// src/App.jsx
import Dashboard from "./ui/layout/Dashboard.jsx";
import KitchenCanvas from "./ui/sketches/KitchenCanvas.jsx";

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