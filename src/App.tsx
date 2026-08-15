import DesktopCharm from "./components/charm/DesktopCharm";
import Customizer from "./components/customizer/Customizer";
import "./styles/theme.css";
import "./App.css";

function App() {
  const isCharmWindow = document.documentElement.dataset.view === "charm";
  return isCharmWindow ? <DesktopCharm /> : <Customizer />;
}

export default App;
