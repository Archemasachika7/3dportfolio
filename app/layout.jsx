"use client"

import { MotionConfig } from "framer-motion"
import "./globals.css"
import CursorSystem from "../components/CursorSystem"

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

        <header className="site-nav">
          <a href="/" className="site-nav__mark" data-cursor="interactive">
            ARCHISHMAN DAS
          </a>

          <nav className="site-nav__links">
            <a href="/" data-cursor="interactive">Home</a>
            <a href="/projects" data-cursor="interactive">Projects</a>
            <a href="/resume" data-cursor="interactive">Resume</a>
            <a href="/certificates" data-cursor="interactive">Certificates</a>
          </nav>

          <a
            href="/admin"
            className="site-nav__admin"
            data-cursor="interactive"
          >
            Admin
          </a>
        </header>

        <main>{children}</main>

        <style>{`
          .site-nav {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: var(--sp-6);
            padding: var(--sp-3) var(--spine-x);
            background: color-mix(in srgb, var(--bg) 88%, transparent);
            backdrop-filter: blur(6px);
            border-bottom: var(--line-thickness) solid var(--line);
          }
          .site-nav__mark {
            font-family: var(--font-mono);
            font-size: var(--fs-000);
            letter-spacing: 0.14em;
            text-decoration: none;
            color: var(--ink);
          }
          .site-nav__links {
            display: flex;
            gap: var(--sp-5);
            font-family: var(--font-mono);
            font-size: var(--fs-000);
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          .site-nav__links a,
          .site-nav__admin {
            color: var(--ink-muted);
            text-decoration: none;
            transition: color var(--t-micro) var(--ease-out);
          }
          .site-nav__links a:hover,
          .site-nav__admin:hover {
            color: var(--ink);
          }
          .site-nav__admin {
            margin-left: auto;
            font-family: var(--font-mono);
            font-size: var(--fs-000);
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          @media (max-width: 720px) {
            .site-nav {
              gap: var(--sp-3);
              flex-wrap: wrap;
            }
            .site-nav__links {
              gap: var(--sp-3);
            }
          }
        `}</style>
        </MotionConfig>
      </body>
    </html>
  )
}
