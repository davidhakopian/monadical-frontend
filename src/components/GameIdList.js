import React, { Component } from 'react';

class GameIdList extends Component {
    state = { 

    } 
    render() { 
        return (
            this.props.gameIdList.map((x) => {
                return <div key={x}>Game Id: {x}</div>
            })
        );
    }
}
 
export default GameIdList;