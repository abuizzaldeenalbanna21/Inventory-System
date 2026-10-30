import { modules as discoveredModules } from "./.generated/mockup-components";
import ComponentPreviewPage from './pages/component-preview';
import GalleryPage from './pages/gallery';
import { getPreviewPath } from './lib/preview-paths';

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <ComponentPreviewPage
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <GalleryPage />;
}

export default App;
