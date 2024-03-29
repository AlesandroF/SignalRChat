import React, { useState, useEffect } from "react";
import { Container, MessagesBox } from "./styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import * as signalR from "@aspnet/signalr";

function Chat() {
  const ENTER_KEY_CODE = 13;
  const [name, setName] = useState("Anônimo");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hubConnection, setHubConnection] = useState(null);

  useEffect(() => {
    var userName = window.prompt("Seu nome: ", "Yuri");
    setName(userName);
    setHubConnection(
      new signalR.HubConnectionBuilder()
        .withUrl(`${window.ENV.CHATHUB}?username=${userName}`)
        .build()
    );
  }, []);
  useEffect(() => {
    if (hubConnection) {
      hubConnection
        .start()
        .then(() => console.log("Conectou com sucesso no hub."))
        .catch(err => console.log("Erro ao conectar no hub."));

      hubConnection.on("sendMessage", messageReceived => {
        messageReceived.date = getDate();
        var isUser = messageReceived.name === name;
        messageReceived.color = isUser ? "green" : "blue";
        setMessages(oldMessages => [...oldMessages, messageReceived]);

        if (!isUser) {
          new Notification(messageReceived.name, {
            body: messageReceived.text
          });
        }
      });
    }
  }, [hubConnection]);

  function handleKeyUp(event) {
    var code = event.keyCode || event.which;
    if (code === ENTER_KEY_CODE && message) {
      sendMessage(name, message);
    }
  }

  function sendMessage(name, message) {
    hubConnection
      .invoke("SendMessage", { Name: name, Text: message })
      .catch(err => console.error(err));
    setMessage("");
  }

  function getDate() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();

    return `${day}/${
      month < 10 ? `0${month}` : `${month}`
    }/${year} ${hour}:${minute}`;
  }

  return (
    <Container>
      <div style={{ margin: "0px 0px 5px 5px" }}>
        {messages.map((messageReceived, index) => (
          <div style={{ display: "block" }} key={index}>
            <span style={{ color: messageReceived.color }}>
              {messageReceived.name}{" "}
            </span>
            <span style={{ color: "gray" }}>({messageReceived.date}): </span>
            <span>{messageReceived.text}</span>
          </div>
        ))}
      </div>

      <MessagesBox>
        <TextField
          id="filled-basic"
          label="Mensagem"
          variant="filled"
          onChange={e => setMessage(e.target.value)}
          value={message}
          onKeyPress={handleKeyUp}
          style={{
            width: "100%",
            backgroundColor: "white"
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => sendMessage(name, message)}
          style={{
            boxShadow: "none",
            color: "#fff",
            width: "100px",
            borderRadius: "0%"
          }}
        >
          Enviar
        </Button>
      </MessagesBox>
    </Container>
  );
}

export default Chat;
