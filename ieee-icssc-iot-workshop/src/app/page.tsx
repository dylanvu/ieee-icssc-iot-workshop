'use client'
import { ChatMessage } from '@/interfaces/chat'
import { useEffect, useState, useRef, RefObject } from 'react'
import { Grid, GridItem, Progress } from '@chakra-ui/react'
import firebase from '@/components/firebase'
import { getDatabase, ref, onChildAdded, get, off } from 'firebase/database'

export default function Home() {
    const startingCountdown = 5
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [currentTime, setCurrentTime] = useState<number>(startingCountdown)

    // create dummy data
    const dummyMessage: ChatMessage = {
        author: 'Alice',
        message: 'Hello, World!',
        timestamp: new Date('5/6/2024, 5:36:57 PM').toLocaleTimeString(),
    }

    const initial: ChatMessage[] = []
    for (let i = 0; i < 100; i++) {
        initial.push(dummyMessage)
    }

    useEffect(() => {
        const db = getDatabase(firebase)
        const messagesRef = ref(db, 'messages')

        // get existing messages
        get(messagesRef).then((snapshot) => {
            const initialMessages: ChatMessage[] = []
            snapshot.forEach((childSnapshot) => {
                initialMessages.push(childSnapshot.val())
            })
            setMessages(initialMessages)
        })

        // when a new message comes in, update the messages state
        onChildAdded(messagesRef, (snapshot) => {
            const message = snapshot.val()
            setMessages([...messages, message])
        })

        // clean up listener when app unmounts
        return () => {
            off(messagesRef)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentTime === 0) {
                console.log('Countdown finished!')
                clearInterval(interval)
                setCurrentTime(startingCountdown)
            } else {
                setCurrentTime(currentTime - 1)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [currentTime])

    const scrollToBottom = (ref: RefObject<HTMLDivElement>) => {
        console.log('scrolling to bottom')
        ref.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom(messagesEndRef)
        scrollToBottom(chattersEndRef)
    }, [messages])

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chattersEndRef = useRef<HTMLDivElement>(null)

    const uniqueAuthors = messages
        .map((message) => message.author)
        .filter((value, index, self) => self.indexOf(value) === index)

    return (
        <main className="flex min-h-screen flex-col items-center p-12">
            <div className="flex items-center justify-center">
                <h1>ICSSC x IEEE ESP32 Real-time Chat</h1>
            </div>
            <Grid templateColumns="4fr 1fr" gap={6} width={'80vw'}>
                <GridItem colSpan={1}>
                    <h2>Chat</h2>
                    <div className="chatbox-container flex items-center justify-center">
                        {messages && messages.length ? (
                            messages.map((message, index) => {
                                return (
                                    <div key={`message-${index}`}>
                                        <span>[{message.timestamp}]&nbsp;</span>
                                        <span
                                            style={{
                                                color: stringToColour(
                                                    message.author
                                                ),
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {message.author}:&nbsp;
                                        </span>
                                        <span>{message.message}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="progress-container">
                                <h3 className="progress-label">
                                    Waiting for messages...
                                </h3>
                                <Progress
                                    size="md"
                                    isIndeterminate
                                    colorScheme="pink"
                                />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </GridItem>
                <GridItem colSpan={1}>
                    <h2>Chatters</h2>
                    <div className="chatbox-container">
                        {uniqueAuthors.map((author, index) => {
                            return <div key={`author-${index}`}>{author}</div>
                        })}
                        <div ref={chattersEndRef} />
                    </div>
                </GridItem>
            </Grid>
        </main>
    )
}

function stringToColour(str: string): string {
    let hash = 0
    str.split('').forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        colour += value.toString(16).padStart(2, '0')
    }
    return colour
}
