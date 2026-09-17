"use client"

import { MotionConfig } from "framer-motion"
import "./globals.css"
import CursorSystem from "../components/CursorSystem"
import SiteNav from "../components/SiteNav"
import SiteFooter from "../components/SiteFooter"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Archishman Das | Portfolio</title>
        <meta
          name="description"
          content="Engineer, data scientist and builder — a technical portfolio spanning structural engineering, data science and business."
        />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <CursorSystem />
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </MotionConfig>
      </body>
    </html>
  )
}
