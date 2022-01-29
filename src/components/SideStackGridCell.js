import React, { Component } from 'react'
import './SideStackGrid.css'

class SideStackGridCell extends Component {
    constructor(props){
        super(props)
        this.state = {
            canBeSelected: props.canBeSelected,
            value: props.value
        }
    }

    handleClick = () => {
        this.props.selectCell(this.props.x, this.props.x)
    }

    render() { 
        if(this.state.canBeSelected){
            return (<div onClick={this.handleClick} className="square-cell-div available">{this.state.value}</div>)
        }
        else{
            return (<div onClick={this.handleClick} className="square-cell-div unavailable">{this.state.value}</div>)
        }
    }
}
 
export default SideStackGridCell;