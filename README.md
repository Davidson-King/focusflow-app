# FocusFlow

FocusFlow is a minimalist, privacy-first productivity dashboard designed to help you organize your life. It's an all-in-one, offline-first application for managing tasks, notes, goals, and more, with the core principle that your data always stays on your device.

## Core Philosophy: Your Data, Your Device

-   **No Accounts, No Clouds:** Your data is stored exclusively in your browser's local database. We have no access to it.
-   **Works Perfectly Offline:** Fully functional without an internet connection.
-   **Blazing Fast:** With no network latency, the app is incredibly responsive.

## Getting Started

This project uses a build-less setup with ES modules but includes an `npm`-based workflow for development, testing, and building.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 20.x or later recommended)
-   `npm` (comes with Node.js)

### Installation

1.  Clone the repository to your local machine.
2.  Navigate to the project directory in your terminal.
3.  Install the development dependencies:

    ```bash
    npm install
    ```

### Running the Development Server

To run the app locally for development, use the following command. This will start a server, and you can view the application in your browser, typically at `http://localhost:3000`.

```bash
npm run dev
```

### Running Tests

The project includes an end-to-end test suite using Playwright. To run the tests, first make sure the development server is running in a separate terminal (`npm run dev`), then run:

```bash
npm test
```

The script will launch a headless browser, navigate to the in-app test runner, and report the results in your terminal.

### Building for Production

While the project is build-less, a build script is provided to copy all necessary files into a `/dist` directory. This is useful for creating a clean artifact for deployment.

```bash
npm run build
```

The contents of the `/dist` folder can then be deployed to any static web host.
