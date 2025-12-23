import { useRoutes } from "react-router-dom";
import router from "./app/router";
import { RegistrationProvider } from "./contexts/RegistrationContext";
import "./App.css";

function App() {
  const routes = useRoutes(router);

  if (!routes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">INAANAK</h1>
          <p className="text-gray-600">Loading registration system...</p>
        </div>
      </div>
    );
  }

  return <RegistrationProvider>{routes}</RegistrationProvider>;
}

export default App;
