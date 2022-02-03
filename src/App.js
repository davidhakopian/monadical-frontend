import React, { Component } from 'react';
import LoginBox from './components/LoginBox';
import './App.css';
import SideStackGrid from './components/SideStackGrid';
import GameIdList from './components/GameIdList';
import { w3cwebsocket } from 'websocket';

const client = new w3cwebsocket("ws://localhost:8765", null, window.location.pathname)

class App extends Component {
  constructor(props){
    super(props)
    this.state = { 
      userLoggedIn: false,
      currentUserDisplayName: "",
      inGame: false,
      connectedToServer: false,
      currentPlayer: null,
      clientStatus: "Connecting to Server..."  ,
      showGameIdList: true,
      gameIdList: []
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
      if(data.type === "gameList"){
        this.setState({
          gameIdList: data.list
        })
      }
    }
    client.onopen = () => {
      this.updateClientStatus("Client connected, waiting for player 2 to join...")
      this.sendWindowLocation()
    }
  }

  sendWindowLocation = () => {
    client.send(JSON.stringify({
      type: "url",
      value: window.location.pathname
  }))
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

  toggleGameList = () => {
    this.setState({
      showGameIdList: !this.state.showGameIdList
    })
  }

  render() { 
    if(this.state.showGameIdList){
      return <div><GameIdList gameIdList={this.state.gameIdList}></GameIdList>
      <button onClick={this.toggleGameList}>Hide Game List</button></div>
    }
    if(!this.state.userLoggedIn){
      return <React.Fragment>
        <LoginBox logInUser={this.logInUser} client={this.state.client}></LoginBox>
        <button onClick={this.toggleGameList}>Show Game List</button>
        </React.Fragment>
    }
    else if(!this.state.inGame){
      return <div>
        <div>Logged in as: {this.state.currentUserDisplayName}</div>
        <div>{this.state.clientStatus}</div>
        <button onClick={this.toggleGameList}>Show Game List</button>
      </div>
    }
    else{
      return <div>
        <div>Logged in as: {this.state.currentUserDisplayName}</div>
        <div>{this.state.clientStatus}</div>
        <SideStackGrid updateClientStatus={this.updateClientStatus} currentPlayer={this.state.currentPlayer} client={client}></SideStackGrid>
        <button onClick={this.toggleGameList}>Show Game List</button>  
        </div>
    }
  }
}
 
export default App;
