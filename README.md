# dnaviewer
Browser Based Viewer of DNA

## Introduction
This is Jake Dluhy's response to the assignment provided by Desktop Genetics. It implements a single page application using d3.js, jquery.js, and bootstrap to take the JSON fixture and create a visual representation of a plasmid as well as the associated information linked in a table.

## Getting Started
Fork the repo and download to your local machine. Navigate to /app and run `npm install` to download the node modules required. Next run `npm -g install casperjs` to download casper, used for the test suite. Finally, run `bower install` to install all the bower packages.

## Running the Application
From /app, run the command node app.js to start up the server on `localhost:3300`. This will serve the static web pages associated with this project. Go to localhost:3300 to visualize the data.

The focus is on simplicity; mousing over elements in the table will show the corresponding elements in the visual representation of the plasmid. Similarly mousing over the plasmid will highlight the table. Clicking either the plasmid or table element will link out to another page. For my application, it is simply a page that could represent additional information. The purpose is to link out to something such as features/:id so that a user could get a more detailed view, or perhaps a purchasing page.

Note that there were specific elements that I decided to focus on over others. In particular I ordered the elements in the table in order to easily match between the table and the figure. The easy visual linking between the two by raising the arc piece and table highlighting is to make it easy for someone to understand the relative placement of elements. Additionally features contained within other features are specifically changed so as to easily identify where they are and the feature they are contained within.

I also specifically decided not to implement a search functionality. Perhaps this is only applicable to the specific fixture I was working with, but it didn't seem like there were enough features to implement the functionality to search through the table. However if there was a use case for larger plasmids I could see the merit in reversing this decision.

Likewise, I didn't see the merit in being able to zoom, rotate, or scale the diagram. Although there are small slivered elements that are difficult to see in detail, I also don't forsee a use case where someone would want to see a particular arc in larger scale.

## Running the Tests
As mentioned above, run `npm -g install casperjs` from /app to globally install casper. Navigate to /app/test and run the command `casperjs test test.js`. This will run casper and the 10 tests associated with the project, primarily designed to ensure that the data is populated by d3 on page load. UI interface behavior was not tested.