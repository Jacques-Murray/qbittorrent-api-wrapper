# qBittorrent API Wrapper

## Project Overview

qBittorrent API Wrapper is a TypeScript library designed to simplify interaction with the qBittorrent Web API v2. It provides developers with an intuitive interface for managing torrents, retrieving application information, and leveraging advanced features.

### Key Features

- Authentication
- Torrent management (add, pause, resume, delete)
- Application information (API version, preferences)
- Advanced features (set category, retrieve peers)

## Features

### Authentication

- Login and logout functionality with session management.

### Torrent Management

- Add torrents via URLs or files.
- Pause, resume, and delete torrents.
- Retrieve torrent information (progress, state, size, etc.).

### Application Information

- Get API version.
- Retrieve application preferences.

### Advanced Features

- Set torrent categories.
- Retrieve torrent peers.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher recommended).
- npm (v8 or higher recommended).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Jacques-Murray/qbittorrent-api-wrapper.git
   ```

2. Navigate to the project directory:

   ```bash
   cd qbittorrent-api-wrapper
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

## Usage Guidelines

### Initialization

```typescript
import { QBittorrentClient } from 'qbittorrent-api-wrapper';

const client = new QBittorrentClient({
    baseUrl: 'http://localhost:8080',
    username: 'admin',
    password: 'password',
});
```

### Examples

#### Login

```typescript
await client.login();
```

#### Add Torrent

```typescript
await client.addTorrent({
    urls: 'magnet:?xt=urn:btih:example',
});
```

#### Retrieve Torrent Info

```typescript
const torrents = await client.getTorrentInfo({ filter: 'downloading' });
console.log(torrents);
```

#### Pause Torrent

```typescript
await client.pauseTorrent('torrent-hash');
```

#### Set Category

```typescript
await client.setCategory('torrent-hash', 'movies');
```

## Development Notes

### Coding Standards

- Follow TypeScript best practices.
- Ensure strict type checking (`strict` mode enabled in `tsconfig.json`).

### Testing

- Write unit tests for new features.
- Use mock data for API testing.

### Contribution Guidelines

- Fork the repository.
- Create a feature branch.
- Submit a pull request with detailed descriptions.

## Additional Information

### Acknowledgments

- Built using the `ofetch` library for HTTP requests.

### Links

- [qBittorrent Web API Documentation](https://github.com/qbittorrent/qBittorrent/wiki/Web-API-Documentation)
- [GitHub Repository](https://github.com/Jacques-Murray/qbittorrent-api-wrapper)

### License

- MIT License
