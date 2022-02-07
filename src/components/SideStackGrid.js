import React, { Component } from 'react'
import './SideStackGrid.css'

class SideStackGrid extends Component {
    constructor(props){
        super(props)
        this.state = {
            gridSize: 7,
            grid: this.generateEmptyGridArray(7),
            turnNumber: 0
        }

        // this.props.client.onmessage = (message) => {
        //     var data = JSON.parse(message.data)
        //     if(data.type === "move"){
        //         this.selectCell(data.x, data.y)
        //         this.setState({
        //             yourTurn: true
        //         }) 
        //     }     
        // }

        this.props.updateStatusCallback(this.props.userCanSelect ? "It's your turn" : "Waiting for opponent to make a move...")
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.state.turnNumber < this.props.turnNumber){
            this.selectCell(this.props.selectX, this.props.selectY)
        }
    }


    handleClick = (x,y) => {
        console.log("clicked (" + x + ", " + y + ")")
        if(this.props.userCanSelect && this.state.grid[y][x].canBeSelected){
            this.props.userSelectCallback(x, y)
        }
    }

    randomMove = () => {
        var grid = this.state.grid
        while(true){
            for(var i = 0; i < this.state.gridSize; i++){
                for(var j = 0; j < this.state.gridSize; j++){
                    if(grid[i][j].canBeSelected && Math.floor(Math.random() * this.state.gridSize*2) === 1){
                        this.selectCell(j, i)
                        this.props.aiMoveCallback(j, i)
                        return
                    }
                }
            }
        }
    }

    selectCell = (x, y) => {
        var grid = [...this.state.grid]  
        
        if(x === null || y === null){
            this.randomMove()
            return
        }

        //Update selected cell
        grid[y][x].value = this.props.playerSymbol
        grid[y][x].canBeSelected = false

        //Set next slot to selectable
        if(grid[y][x+1] !== undefined && grid[y][x+1].value == null) 
            grid[y][x+1].canBeSelected = true
        else if(grid[y][x-1] !== undefined && grid[y][x-1].value == null) 
            grid[y][x-1].canBeSelected = true
        
        //Re-render Grid
        this.setState({
            grid,
            turnNumber: this.props.turnNumber
        })

        //Check if game is over 
        console.log("Selected cell: " + x + ", " + y)
        if(this.gameOver(x, y)){
            this.props.gameOverCallback()
        }
    }

    gameOver = (x, y) => {
        if(this.checkForkWin(x, y)){
            this.props.updateStatusCallback("Game Over: " + (!this.props.userCanSelect ? "You win" : "You lose"))
            return true
        }
        else if(this.checkForDraw(x, y)){
            this.props.updateClientStatus("Game Over: No one wins")
            return true
        }
        return false
    }

    checkForkWin = (x, y) => {
        if(this.checkSumBottom(x, y) + this.checkSumTop(x, y) >= 3 || 
        this.checkSumLeft(x, y) + this.checkSumRight(x, y) >= 3 ||
        this.checkSumTopLeft(x, y) + this.checkSumBottomRight(x, y) >= 3 ||
        this.checkSumBottomLeft(x, y) + this.checkSumTopRight(x, y) >= 3){
            return true
        }
        return false
    }

    checkForDraw = (x, y) => {
        if(this.props.turnNumber === this.state.gridSize * this.state.gridSize){
            return true
        }
        return false
    }

    //HORIZONTAL CHECK
    checkSumLeft(x, y){
        if(x === 0 || this.state.grid[y][x-1].value !== this.props.playerSymbol) {
            return 0
        }
        else {
            return 1 + this.checkSumLeft(x-1, y)
        }
    }

    checkSumRight(x, y){
        if(x === this.state.gridSize-1 || this.state.grid[y][x+1].value !== this.props.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumRight(x+1, y)
    }

    //VERTICAL CHECK
    checkSumTop(x, y){
        if(y === 0 || this.state.grid[y-1][x].value !== this.props.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumTop(x, y-1)
    }

    checkSumBottom(x, y){
        if(y === this.state.gridSize-1 || this.state.grid[y+1][x].value !== this.props.playerSymbol) 
            return 0
        else 
            return 1 + this.checkSumBottom(x, y+1)
    }

    //DIAGONAL CHECK
    checkSumTopRight(x, y){
        if(y === 0 || x === this.state.gridSize-1 || this.state.grid[y-1][x+1].value !== this.props.playerSymbol) return 0
        else return 1 + this.checkSumTopRight(x+1, y-1)
    }

    checkSumTopLeft(x, y){
        if(y === 0 || x === 0 || this.state.grid[y-1][x-1].value !== this.props.playerSymbol) return 0
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

    render() { 
        if(this.state.grid != null && !this.state.gameOver){
            return (<div>
                {this.state.grid.map((row, columnIndex) => 
                <div key={columnIndex}>
                    {row.map((cell, rowIndex) =>
                    <div onClick={() => this.handleClick(rowIndex, columnIndex)} className={'square-cell-div ' + (cell.canBeSelected ? 'available' : 'unavailable')} key={rowIndex}>
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