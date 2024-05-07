import { NextRequest, NextResponse } from 'next/server'
import firebase from './firebase-backend'
import { getDatabase, ref, push, set } from 'firebase/database'

export async function GET(request: NextRequest) {
    const data = 'ICSSC x IEEE IoT Workshop Get Request Data Success!'
    return NextResponse.json(
        { data: data },
        {
            status: 200,
        }
    )
}

export async function POST(request: NextRequest, { params }: any) {
    const reqJSON = await request.json()
    // query database to upload this new message
    const messageToUpload = reqJSON.message
    const author = reqJSON.author
    if (!messageToUpload || messageToUpload.length === 0) {
        // missing or malformed body
        return NextResponse.json(
            { message: 'Error: Missing message in request body.' },
            { status: 400 }
        )
    }

    if (!author || author.length === 0) {
        // missing or malformed body
        return NextResponse.json(
            { message: 'Error: Missing author in request body.' },
            { status: 400 }
        )
    }

    const db = getDatabase(firebase)

    // create a timestamp of the message in Los Angeles time
    const options = {
        timeZone: 'America/Los_Angeles',
    }
    const timestamp = new Date().toLocaleString('en-US', options)

    const messageListRef = ref(db, 'messages')
    const newMessageRef = push(messageListRef)
    set(newMessageRef, {
        author: author,
        message: messageToUpload,
        timestamp: timestamp,
    })

    console.log(
        'Wrote message to database:',
        messageToUpload,
        'from author:',
        author,
        'at timestamp:',
        timestamp
    )
    return NextResponse.json(
        {
            message:
                'ICSSC x IEEE IoT Workshop: POST request successfully received',
        },
        { status: 201 }
    )
}
