import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client'
const socket = openSocket() //leave these empty in production, but they need the server port in development

class App extends Component {

  state = {
    message: '',
    message2: '',
    name1: '',
    messages: [],
    adminMessages: [],
    admin: false,
    password: '',
    loggedIn: false
  }

  componentDidMount() {
    socket.on('date', date => {
      // console.log(date)
    })
    socket.on('messageFromServer', ({ admin, message, name }) => {
      if (admin) {
        let newMsgs = this.state.adminMessages.slice()
        newMsgs.push({message,name})        
        this.setState({adminMessages:newMsgs})
      } else {
        let newMsgs = this.state.messages.slice()
        newMsgs.push({message, name})
        this.setState({messages: newMsgs})
      }
    })
    socket.on('adminConfirm', confirmation => {
      this.setState({ admin: confirmation })
      if(!confirmation){alert('Wrong password. PleaSe TRy AgaIN')}
    })
  }

  handleMessage = (e) => {
    this.setState({ message: e.target.value })
  }

  handleMessage2 = (e) => {
    this.setState({ message2: e.target.value })
  }

  handleName = e => {
    this.setState({name: e.target.value})
  }

  handlePassword = e => {
    this.setState({password: e.target.value})
  }

  logIn = () => {
    this.setState({ loggedIn: true })
    socket.emit('userLoggingIn',
    this.state.name)
  }

  submit = () => {
    socket.emit('messageFromClient', { message: this.state.message })
    this.setState({message: ''})
  }
  submit2 = () => {
    const message =this.state.message2
    socket.emit('messageFromClient', {admin: true, message})
    this.setState({ message2: '' })
  }

  joinAdmin = () => {
    socket.emit('pwFromClient', this.state.password)
  }
  render() {
    return (
      this.state.loggedIn ?
      <div className="App">
        <div className='room1' >
          <input type="text" onChange={this.handleMessage} value={this.state.message}
          placeholder= 'message'
          />
        <button onClick={this.submit} >Send</button>
        {this.state.messages.map((message, i) => {
          return (
            <div key={`message${i}`} >{message.message} -{message.name}</div>
          )
        })}
        </div> 
        {
          this.state.admin ?
            <div className="room2">
              <input type="text" onChange={this.handleMessage2} value={this.state.message2} />
              <button onClick={this.submit2} >Send</button>
              {this.state.adminMessages.map((message, i) => {
                return (
                  <div key={`message${i}`} >
                    {message.message} -{message.name}
                  </div>
                )
              })}</div>
            :
            <div className="room2">
              <input type="password" placeholder='Password' onChange={this.handlePassword}/>  
            <button onClick={this.joinAdmin} >JOIN ADMIN</button>  
            </div>
            }  
        </div> 
        :
        <div className='.App'>
          <input type="text" value={this.state.name} onChange={this.handleName} placeholder='name' /> 
          <button onClick={this.logIn} >LogIn</button>
      </div>
      
    );
  }
}

export default App;
