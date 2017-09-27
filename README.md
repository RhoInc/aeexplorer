# Adverse Event Explorer

![alt tag](https://user-images.githubusercontent.com/31038805/30920449-fd3e45b2-a371-11e7-9502-df5f9c7cbace.gif)

## Overview
The AE Explorer is a JavaScript library that allows users to dynamically query adverse event (AE) data in real time. A typical AE Explorer looks like this: 



Users can click on any row in the table to create a listing like this: 



The AE Explorer is an open source project built using standard web technology and will run in any modern web browser. The displays created are all dynamically linked to coded adverse event data which allows the tool to work with data from any adverse event coding system, e.g. MedDRA. The charts are created using [D3](http://www.d3js.org "D3.js").

The AE Explorer contains all of the information available in standard listings, but we apply interactive elements common in website design to give users the ability to search the data. The default view is a single-screen display of AEs grouped by the MedDRA System Organ Class. Dot plots portray the incidence in the different treatment groups. 

Users can interact with the display in real time to:
* Filter by prevalence threshold (e.g., AEs with prevalence >5%)
* Change the input on the serious event filter, and see an updated chart
* Change the input on the severity filter, and see an updated chart
* Change the input on the relationship filter, and see an updated chart
* Change the input on the outcome filter, and see an updated chart
* Toggle between participant and event summaries
* Search/display terms of interest
* Reset search
* Display metadata on mouse-hover
* View adverse event rate by group
* View confidence intervals for between-group differences
* Expand the data set to show nested preferred terms
* Collapse the data set to hide nested preferred terms
* Show details view
* Return to summary view from details view
* Filter the Safety Explorer for selected criteria, and see an updated chart (optional)
* View treatment groups (optional)
* Download the data to CSV

