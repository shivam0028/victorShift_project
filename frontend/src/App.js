import { PipelineToolbar } from './toolbar';
import { ResizableLayout } from './resizableLayout';
import { useStore } from './store';
import { useEffect } from 'react';

function App() {
  const darkMode = useStore((state) => state.darkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, [setDarkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className="app-container">
      <PipelineToolbar />
      <ResizableLayout />
    </div>
  );
}

export default App;
