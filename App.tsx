import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddUser from './AddUser';
import ViewUser from './ViewUser';
import EditUser from './EditUser';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AddUser />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
        <Route path="/view-user/:id" element={<ViewUser />} />
      </Routes>
    </Router>
  );
}

export default App;


