import React, { Component } from 'react';


class LoginBox extends Component {

    state = {
        displayName: "",
        isLoggedIn: false
    }

    handleInputChange = (event) => {
        event.preventDefault()
        this.setState({
            displayName: event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault()
        //Send request and check for response using props.client
        this.props.logInUser(this.state.displayName)
        this.setState({
            loggedIn: true
        })
    }

    render() { 
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Display Name
                    </label>
                    <input 
                        name="displayName" 
                        type="text"
                        value={this.state.displayName}
                        onChange={this.handleInputChange}></input>
                    <button type="submit">Play</button>
                </form>
            </div>
        );
    }
}
 
export default LoginBox;