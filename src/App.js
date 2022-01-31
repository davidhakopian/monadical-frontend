import React, { Component } from 'react';
import LoginBox from './components/LoginBox';
import './App.css';
import SideStackGrid from './components/SideStackGrid';
import { w3cwebsocket } from 'websocket';

const client = new w3cwebsocket("ws://localhost:8765")

class App extends Component {
  constructor(props){
    super(props)
    this.state = { 
      userLoggedIn: false,
      currentUserDisplayName: "",
      inGame: false,
      connectedToServer: false,
      currentPlayer: null,
      clientStatus: "Connecting to Server..."  
    }
    client.onmessage = (message) => {
      var data = JSON.parse(message.data)
      if(data.type === "setup"){
        this.setState({
          currentPlayer: data.player
        })
      }
      this.setState({
        inGame: true
      })
    }
    client.onopen = () => {
      this.updateClientStatus("Client connected, waiting for player 2 to join...")
    }
  }

  logInUser = (displayName) => {
    //Send user info to server
    this.setState({
      userLoggedIn: true,
      currentUserDisplayName: displayName
    })
  }

  updateClientStatus = (message) => {
    this.setState({
      clientStatus: message
    })
  }

  render() { 
    if(!this.state.userLoggedIn){
      return <React.Fragment><LoginBox logInUser={this.logInUser} client={this.state.client}></LoginBox></React.Fragment>
    }
    else if(!this.state.inGame){
      return <div>
        <div>Logged in as: {this.state.currentUserDisplayName}</div>
        <div>{this.state.clientStatus}</div>
      </div>
    }
    else{
      return <div>
        <div>Logged in as: {this.state.currentUserDisplayName}</div>
        <div>{this.state.clientStatus}</div>
        <SideStackGrid updateClientStatus={this.updateClientStatus} currentPlayer={this.state.currentPlayer} client={client}></SideStackGrid>
        </div>
    }
  }
}
 
export default App;
