'use client';
import { ChatMessage } from "@/interfaces/chat";
import { useEffect, useState } from "react";
import { CircularProgress, CircularProgressLabel, Grid, GridItem } from "@chakra-ui/react";

export default function Home() {
  const startingCountdown = 5;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(startingCountdown);

  // create dummy data
  const dummyMessage = {
    author: "Alice",
    message: "Hello, World!",
    timestamp: new Date("5/6/2024, 5:36:57 PM").toLocaleTimeString(),
  };

  useEffect(() => {
    setMessages([
      dummyMessage,
      dummyMessage,
      dummyMessage,
      dummyMessage
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTime === 0) {
        console.log("Countdown finished!");
        clearInterval(interval);
        setCurrentTime(startingCountdown);
        // TODO: remove me
        setMessages([...messages, dummyMessage]);
      } else {
        setCurrentTime(currentTime - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTime]);

  const uniqueAuthors = messages.map((message) => message.author).filter((value, index, self) => self.indexOf(value) === index);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <CircularProgress
        value={currentTime ? (currentTime / startingCountdown) * 100 : 0.0000000001}
        color="pink.400"
        // #fcaec2
        size="120px"
      >
        <CircularProgressLabel>{currentTime}s</CircularProgressLabel>
      </CircularProgress>
      <div>Refresh Timer</div>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <h1>Chat</h1>
          {messages.map((message, index) => {
            return (
              <div key={`message-${index}`}>
                <span>[{message.timestamp}]&nbsp;</span>
                <span>{message.author}:&nbsp;</span>
                <span>{message.message}</span>
              </div>
            );
          })}
        </GridItem>
        <GridItem colSpan={1}>
          <h1>Chatters</h1>
          {uniqueAuthors.map((author, index) => {
          return <div key={`author-${index}`}>{author}</div>
        })}</GridItem>
      </Grid>
    </main>
  );
}
