import React, { Component } from 'react';
import './App.css';
import SideStackGrid from './components/SideStackGrid';
import GameIdList from './components/GameIdList';
import { w3cwebsocket } from 'websocket';

const client = new w3cwebsocket("ws://localhost:8765", null, window.location.pathname)

class App extends Component {
  constructor(props){
    super(props)
    this.state = { 
      currentPage: "Home",
      players: 1,
      turnNumber: 0,
      gameOver: false
    }
    
    client.onmessage = (message) => {
      var data = JSON.parse(message.data)
      switch(data.type){
        case "gameList":
          this.handleGetGameList(data.list)
          break
        case "moveList":
          this.toggleReplayGame(data.list)
          break
        case "newGame":
          this.handleNewGame(data.youStart)
          break
        case "move":
          if(this.state.currentPage === "2playerMode"){
            this.handleMove(data.x, data.y, true)
          }
          break
        default:
          this.setState({
            statusMessage: "Error occurred"
          })
      }
    }
    client.onopen = () => {
      
    }
  }

  togglePage = (page) => {
    switch(page) {
      case "1playerMode":
        this.start1PlayerGame()
        break
      case "2playerMode":
        this.start2PlayerGame()
        break
      case "gameList":
        this.getGameList()
        break
      default:
        this.setState({
          currentPage: "Home",
          gameOver: false,
          turnNumber: 0
        })
        break
    }
  }

  setStatusMessage = (message) => {
    this.setState({
      statusMessage: message
    })
  }

  handleGetGameList = (list) => {
    this.setState({
      currentPage: "gameList",
      gameIdList: list
    })
  }

  start1PlayerGame = () => {
    client.send(JSON.stringify({
      type: "newGame1P"
    }))

    this.setState({
      players: 1,
      statusMessage: "Loading game..."
    })
  }

  start2PlayerGame = () => {
    client.send(JSON.stringify({
      type: "newGame2P"
    }))
    this.setState({
      players: 2,
      statusMessage: "Waiting for other player to join..."
    })
  }
  
  getGameList = () => {
    client.send(JSON.stringify({
      type: "getGameList"
    }))
    this.setState({
      statusMessage: "Loading Game List..."
    })
  }

  handleChoseGame = (gameId) => {
    //send request for moves list
    client.send(JSON.stringify({
      type: "getMoveList",
      gameId: gameId
    }))
    this.setState({
      statusMessage: "Loading Game..."
    })
  }

  handleMove(x, y, allowPlayerSelect){
    this.setState({
      turnNumber: this.state.turnNumber+1,
      playerSymbol: this.state.playerSymbol === 'X' ? 'O' : 'X',
      selectX: x,
      selectY: y,
      userCanSelect: allowPlayerSelect
    })
  }

  handleNewGame = (youStart) => {
    this.setState({
      currentPage: this.state.players === 1 ? "1playerMode" : "2playerMode",
      turnNumber: 0,
      playerSymbol: 'X',
      userCanSelect: youStart
    })  
  }

  toggleReplayGame = (movesList) =>{
    this.setState({
      currentPage: "replayMode",
      turnNumber: 0,
      playerSymbol: 'X',
      userCanSelect: false
    }, () => {
      for(let i = 0; i < movesList.length; i++){
        setTimeout(() => {
          this.handleMove(movesList[i].x, movesList[i].y, false)
        }, 2000 * (i+1))
      }
    })
  }

  sendMoveToClient = (x, y) => {
    //send move to backend
    client.send(JSON.stringify({
      type: "move",
      x: x,
      y: y
    }))
  }

  handleUserClick = (x, y) => {
    if(this.state.gameOver){
      return
    }
    if(this.state.currentPage === "1playerMode"){
      //send move to backend
      this.sendMoveToClient(x, y)
      this.handleMove(x, y, false)
      //make move with handleMove
      setTimeout(() => {
        if(!this.state.gameOver){
          this.handleMove(null, null, true)
        }
      }, 1000)
    }
    else{
      //send move to backend
      client.send(JSON.stringify({
        type: "move",
        x: x,
        y: y
      }))
      this.handleMove(x, y, false)
    }
  }

  gameOverCallback = () => {
    this.setState({
      gameOver: true
    })
  }

  render() { 
    if(this.state.currentPage === "Home"){
      return <div>
        <button onClick={() => this.togglePage("1playerMode")}>Start 1 Player Game</button>
        <button onClick={() => this.togglePage("2playerMode")}>Start 2 Player Game</button>
        <button onClick={() => this.togglePage("gameList")}>View Previous Game</button> 
        <div>{this.state.statusMessage}</div> 
      </div>
    }
    else if(this.state.currentPage === "gameList"){
      return <div><GameIdList choseGameCallback={this.handleChoseGame} gameIdList={this.state.gameIdList}></GameIdList>
      <button onClick={() => this.togglePage("Home")}>Hide Game List</button></div>
    }
    else{
      return <div>
      <SideStackGrid 
        userCanSelect={this.state.userCanSelect}
        turnNumber = {this.state.turnNumber}
        playerSymbol = {this.state.playerSymbol}
        selectX = {this.state.selectX}
        selectY = {this.state.selectY}
        userSelectCallback = {this.handleUserClick}
        updateStatusCallback = {this.setStatusMessage}
        aiMoveCallback = {this.sendMoveToClient}
        gameOverCallback = {this.gameOverCallback} ></SideStackGrid>
      <div>{this.state.statusMessage}</div>
      <button onClick={() => this.togglePage("Home")}>Go Back to Menu</button>
    </div>
    }
  }
}
 
export default App;
