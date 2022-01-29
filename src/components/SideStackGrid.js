import React, { Component } from 'react'
import './SideStackGrid.css'

class SideStackGrid extends Component {
    constructor(props){
        super(props)
        this.state = {
            gridSize: 7,
            grid: this.generateEmptyGridArray(7),
            playerSymbol: 'X',
            yourTurn: props.currentPlayer === 1
        }
        this.props.client.onmessage = (message) => {
            var data = JSON.parse(message.data)
            if(data.type === "move"){
                this.selectCell(data.x, data.y)
                this.setState({
                    yourTurn: true
                }, this.updateClientStatusOnTurnChange) 
            }     
        }
        this.updateClientStatusOnTurnChange()
    }

    updateClientStatusOnTurnChange = () => {
        var message = this.state.yourTurn ? "It's your turn" : "Your opponent is thinking..."
        this.props.updateClientStatus(message)
    }

    generateEmptyGridArray = (size) => {
        var grid = []
        for(var i=0; i < size; i++){
            grid.push(this.generateEmptyGridArrayRow(size))
        }
        return grid
    }

    generateEmptyGridArrayRow = (size) => {
        var row = []
        for(var i=0; i < size; i++){
            var available = false;
            if(i===0 || i===size-1){
                available = true
            }
            row.push({
                canBeSelected: available,
                value: null,
            })
        }
        return row
    }

    handleMove = (x,y) => {
        console.log("clicked (" + x + ", " + y + ")")
        var grid = [...this.state.grid]

        //Stop from playing other's turn
        if(!grid[y][x].canBeSelected || !this.state.yourTurn) return
        
        //Send move to server
        this.props.client.send(JSON.stringify({
            type: "move",
            x,
            y
        }))

        this.selectCell(x, y)

        this.setState({
            yourTurn: false
        }, this.updateClientStatusOnTurnChange)
    }

    selectCell = (x, y) => {
        console.log("clicked (" + x + ", " + y + ")")
        var grid = [...this.state.grid]

        //Update selected cell
        grid[y][x].value = this.state.playerSymbol
        grid[y][x].canBeSelected = false

        //Check if game over
        if(this.gameOver(x, y)){
            this.setState({
                grid: this.generateEmptyGridArray(this.state.gridSize)
            })
            return
        }

        //Set next slot to selectable
        if(grid[y][x+1] !== undefined && grid[y][x+1].value == null) 
            grid[y][x+1].canBeSelected = true
        else if(grid[y][x-1] !== undefined && grid[y][x-1].value == null) 
            grid[y][x-1].canBeSelected = true
        
        //Update and Re-render Grid
        this.setState({
            grid 
        })

        //Change player turn
        this.setState({
            playerSymbol : this.state.playerSymbol === 'X' ? 'O' : 'X'
        })
    }

    gameOver = (x, y) => {
        if(this.checkSumBottom(x, y) + this.checkSumTop(x, y) >= 3 || 
        this.checkSumLeft(x, y) + this.checkSumRight(x, y) >= 3 ||
        this.checkSumTopLeft(x, y) + this.checkSumBottomRight(x, y) >= 3 ||
        this.checkSumBottomLeft(x, y) + this.checkSumTopRight(x, y) >= 3){
            this.props.updateClientStatus("Game Over: " + this.state.yourTurn ? "You Won!" : "You Lost!")
            return true
        }
        return false
    }

    //HORIZONTAL CHECK
    checkSumLeft(x, y){
        if(x === 0 || this.state.grid[y][x-1].value !== this.state.playerSymbol) {
            return 0
        }
        else {
            return 1 + this.checkSumLeft(x-1, y)
        }
    }

    checkSumRight(x, y){
        if(x === this.state.gridSize-1 || this.state.grid[y][x+1].value !== this.state.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumRight(x+1, y)
    }

    //VERTICAL CHECK
    checkSumTop(x, y){
        if(y === 0 || this.state.grid[y-1][x].value !== this.state.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumTop(x, y-1)
    }

    checkSumBottom(x, y){
        if(y === this.state.gridSize-1 || this.state.grid[y+1][x].value !== this.state.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumBottom(x, y+1)
    }

    //DIAGONAL CHECK
    checkSumTopRight(x, y){
        if(y === 0 || x === this.state.gridSize-1 || this.state.grid[y-1][x+1].value !== this.state.playerSymbol) return 0
        else return 1 + this.checkSumTopRight(x+1, y-1)
    }

    checkSumTopLeft(x, y){
        if(y === 0 || x === 0 || this.state.grid[y-1][x-1].value !== this.state.playerSymbol) return 0
        else return 1 + this.checkSumTopLeft(x-1, y-1)
    }

    checkSumBottomRight(x, y){
        if(y === this.state.gridSize-1 || x === this.state.gridSize-1 || this.state.grid[y+1][x+1].value !== this.state.playerSymbol) return 0
        else return 1 + this.checkSumBottomRight(x+1, y+1)
    }

    checkSumBottomLeft(x, y){
        if(y === this.state.gridSize-1 || x === 0 || this.state.grid[y+1][x-1].value !== this.state.playerSymbol) return 0
        else return 1 + this.checkSumBottomLeft(x-1, y+1)
    }

    render() { 
        if(this.state.grid != null){
            return (<div>
                {this.state.grid.map((row, columnIndex) => 
                <div key={columnIndex}>
                    {row.map((cell, rowIndex) =>
                    <div onClick={() => this.handleMove(rowIndex, columnIndex)} className={'square-cell-div ' + (cell.canBeSelected ? 'available' : 'unavailable')} key={rowIndex}>
                        {cell.value}
                    </div>)}
                    </div>)}
            </div>);
        }
        else{
            return <div></div>
        }
    }
}
 
export default SideStackGrid;