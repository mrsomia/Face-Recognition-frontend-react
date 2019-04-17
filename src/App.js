import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '405c1ff97b7844d699304026b11ede1d'
});

class App extends Component {
  constructor(){
    super()
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }
  }

  onInputChange = (e) => {
    this.setState({input: e.target.value})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onButtonSubmit = (e) => {
    this.setState({imageUrl: this.state.input});
    app.models.predict("a403429f2ddf4b49b307e318f00e528b",
      this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }

  onRouteChange = (newRoute) => {
    if (newRoute === 'signin') {
      this.setState({isSignedIn: false})
    } else if (newRoute === 'home') {
      this.setState ({isSignedIn: true})
    }
    this.setState({route: newRoute});
  }

  loadUser = (data) => {
    const {id, name, email, entries, joined} = data;
    this.setState({user: {
      id: id,
      name: name,
      email: email,
      entries: entries,
      joined: joined
    }})
  }

  render() {
    return (
      <div className="App">
      <Particles className='particles'/>
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
        { this.state.route === 'home' ?
          <div>
          <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange}
                           onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
          </div> 
          : ( this.state.route === 'signin' ?
            <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )}
      </div>
    );
  }
}

export default App;
