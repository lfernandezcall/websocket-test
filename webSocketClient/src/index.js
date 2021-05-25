import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, Avatar, Input, Typography, message } from 'antd';
import 'antd/dist/antd.css';
import './index.css';

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

export default class App extends Component {
  state = {
    userName: '',
    isLoggedIn: false,
    messages: [],
    searchVal: ''
  };

  componentDidMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
  }

  handleClick = (value) => {
    client.send(
      JSON.stringify({
        type: 'message',
        msg: value,
        user: this.state.userName
      })
    );

    this.setState({ searchVal: '' });

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log('Got reply ', dataFromServer);
      dataFromServer.type === 'message' &&
        this.setState((currenState) => ({
          messages: [
            ...currenState.messages,
            {
              msg: dataFromServer.msg,
              user: dataFromServer.user
            }
          ]
        }));
    };
  };

  render() {
    return (
      <div className='main'>
        {this.state.isLoggedIn === true ? (
          <div>
            <div className='title'>
              <Text id='main-heading' type='secondary' style={{ fontSize: '36px' }}>
                WebSocket Chat: {this.state.userName}
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }}>
              {this.state.messages.map((message, index) => (
                <Card
                  key={`${message.msg}_index`}
                  style={{
                    width: 300,
                    margin: '16px 4px 0 4px',
                    alignSelf: this.state.userName === message.user ? 'flex-end' : 'flex-start'
                  }}
                  loading={false}>
                  <Meta
                    avatar={
                      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                        {message.user[0].toUpperCase()}
                      </Avatar>
                    }
                    title={message.user + ':'}
                    description={message.msg}
                  />
                </Card>
              ))}
            </div>
            <div className='bottom'>
              <Search
                placeholder='input message and send'
                enterButton='Send'
                size='large'
                value={this.state.searchVal}
                onChange={(e) => this.setState({ searchVal: e.target.value })}
                onSearch={(value) => this.handleClick(value)}
              />
            </div>
          </div>
        ) : (
          <Search
            placeholder='Enter Username'
            enterButton='Login'
            size='large'
            onSearch={(value) => {
              this.setState({ isLoggedIn: true, userName: value });
            }}
          />
        )}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
