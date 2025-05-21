<h1>RangeIQ – EV Journey Planner – Frontend Application</h1>
Final Project at La Fosse Academy


## Overview

This is the frontend application for RangeIQ. It allows users to select an electric vehicle, input travel conditions, and visualise the estimated range using Azure Maps. The app is built using HTML, CSS, and JavaScript, with dynamic features such as API integration and DOM interaction.

## Challenge

Range anxiety makes electric vehicle adoption harder. Many users don't know how weather, passengers, or charge level affect their actual driving range. Our goal was to make this clearer using an interactive tool.

## Stakeholder Insights

- Drivers want a simple tool tailored to their specific vehicle.
- Planners want more accurate data to support EV adoption.
- Users want clear feedback on how choices impact travel range.

## Solution

The app provides:

- Vehicle selection with live spec data
- Form inputs for travel conditions
- Range map using Azure isochrone
- Settings saved in localStorage

## Key Features

- Azure Maps radius display
- User input drawer for settings
- LocalStorage for saving user selections
- Fetch requests to a live backend API
- Responsive design for desktop and mobile

## Backlog

- Authentication for user login
- Integration of map routing
- Additional data visualisation options

## Installation – Frontend Only

Clone the repo and move into the client folder:

Test coverage includes:

- Form validation
- DOM manipulation
- LocalStorage usage
- Navigation behaviour

## Development Tools

- HTML, CSS, JavaScript
- Azure Maps API
- Jest + jsdom for testing
- Git + GitHub for version control

## Style Guide

- camelCase for JavaScript variables
- Clear visual hierarchy and simple layout
- Mobile-first CSS using Bootstrap


## Backend Setup

To run the full application locally, you will also need to start the backend server.

Follow these setup steps after setting up the environmental variable as shown from the server README:

```
npm install
npm run setup-db
npm run test
npm run start
```

These commands will:

- Install required dependencies
- Set up the database connection using environment variables
- Run unit tests
- Start the server

Each step should complete without error before continuing to the next. Once the server is running, it will listen for requests at:

http://localhost:3000/