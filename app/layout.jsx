"use client"

import "./globals.css"
import CursorSystem from "../components/CursorSystem"
import CoordinateField from "../components/CoordinateField"
import SiteNav from "../components/SiteNav"
import SiteFooter from "../components/SiteFooter"

// Runs during HTML parsing, before first paint: marks the page as
// JS-capable so the CSS motion gate can hold reveal targets hidden without
// a flash, and arms a failsafe that un-hides them if the app never boots.
const MOTION_BOOT =
  "(function(){var d=document.documentElement;d.classList.add('js');" +
  "setTimeout(function(){d.classList.add('js-failsafe')},4500)})()"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Archishman Das | Portfolio</title>
        <meta
          name="description"
          content="Engineer, data scientist and builder — a technical portfolio spanning structural engineering, data science and business."
        />
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body>
        <CoordinateField />
        <CursorSystem />
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
