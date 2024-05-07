import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChakraProvider } from '@chakra-ui/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ESP32 Chat',
    description: 'ICSSC x IEEE IoT Workshop Chat App',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ChakraProvider>{children}</ChakraProvider>
            </body>
        </html>
    )
}
