import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert} from "firebase-admin/app";
import { ServiceAccount } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// initialize firebase
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString || serviceAccountString.length === 0) {
    throw Error("Error: Firebase service account not found.");
}

initializeApp({
    credential: cert(JSON.parse(serviceAccountString) as ServiceAccount),
});

export async function GET(request: NextRequest) {
    const data = "ICSSC x IEEE IoT Workshop Get Request Data Success!";
    return NextResponse.json({ data: data }, {
        status: 200,
    });
}

export async function POST(request: NextRequest, { params }: any) {
    const reqJSON = await request.json();
    // query database to upload this new message
    const messageToUpload = reqJSON.message;
    const author = reqJSON.author;
    if (!messageToUpload || messageToUpload.length === 0) {
        // missing or malformed body
        return NextResponse.json({message: "Error: Missing message in request body."}, { status: 400 });
    }

    if (!author || author.length === 0) {
        // missing or malformed body
        return NextResponse.json({message: "Error: Missing author in request body."}, { status: 400 });
    }

    const db = getFirestore();

    // create a timestamp of the message in Los Angeles time
    const options = {
        timeZone: 'America/Los_Angeles',
    }
    const timestamp = new Date().toLocaleString('en-US', options);

    // add the message to the database
    // check if there are already messages from the author
    const messageCollection = db.collection("messages");
    const authorQuery = await messageCollection.where("author", "==", author).get();
    // if so, update the existing message log
    
    if (!authorQuery.empty) {
        // update the existing message log
        const messagesDoc = authorQuery.docs[0];
        const messagesData = messagesDoc.data();
        const messages = messagesData.message;
        // avoid spamming
        const mostRecentMessageTimestamp = new Date(messages[messages.length - 1].timestamp);
        // find the difference in seconds
        const newMessageTimestamp = new Date(timestamp);
        const difference = (newMessageTimestamp.getTime() - mostRecentMessageTimestamp.getTime()) / 1000;
        // only write to the database if the message is at least 5 seconds apart
        if (difference < 4) {
            return NextResponse.json({message: "Error: Messages are being sent too fast. Wait 5 seconds."}, { status: 429 });
        }

        // update the existing document with the new message
        messages.push({
            message: messageToUpload,
            timestamp: timestamp,
        });
        await messageCollection.doc(messagesDoc.id).update({
            message: messages,
        });
        
    } else {
        // create a new document
        const newDoc = {
            author: author,
            message: [{ message: messageToUpload, timestamp: timestamp }],
        };
        await messageCollection.add(newDoc);
    }
    console.log("Wrote message to database:", messageToUpload, "from author:", author, "at timestamp:", timestamp);
    return NextResponse.json({message: "ICSSC x IEEE IoT Workshop: POST request successfully received"}, { status: 201 });
}