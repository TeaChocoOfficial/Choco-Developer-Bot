# Choco Developer Bot

## Overview
A Discord bot built with TypeScript, discord.js, and MongoDB (mongoose).

## Project Structure
```
src/
├── index.ts           # Main entry point
├── commands/          # Bot slash commands
├── data/              # Static data (roles, rooms)
├── handlers/          # Event handlers (client, database, member join)
└── models/            # Mongoose models
```

## Technologies
- **Runtime**: Node.js 20 with TypeScript
- **Discord**: discord.js v14
- **Database**: MongoDB via Mongoose
- **Dev Server**: tsx (TypeScript execution with watch mode)

## Environment Variables Required
- `DISCORD_TOKEN` - Discord bot token from the Discord Developer Portal
- `MONGODB_URI` - MongoDB connection string

## Scripts
- `pnpm dev` - Run in development mode with hot reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Run compiled production build

## Workflow
- **Discord Bot**: Runs `pnpm dev` in console mode for development
