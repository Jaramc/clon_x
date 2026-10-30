import { RouterProvider } from 'react-router-dom';
import router from './router';

// Root component that provides the router to the whole application
function App() {
  return <RouterProvider router={router} />;
}

export default App;
