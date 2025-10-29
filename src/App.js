import React from 'react';
import 'bootswatch/dist/pulse/bootstrap.css';
import 'toastr/build/toastr.min';
import 'toastr/build/toastr.css';
import Navbar from './components/navbar.js';
import Rotas from './rotas.js';

class App extends React.Component {
  render() {
    return (
      <div className='container'>
        <Rotas />
        <Navbar />
      </div>
    );
  }
}

export default App;
