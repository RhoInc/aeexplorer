# Adverse Event Explorer
The Adverse Event Explorer is an interactive tool that allows users to dynamically query adverse event (AE) data in real time.

##Technical Details
The Adverse Event Explorer is an open source project built using standard web technology and will run in any modern web browser. The displays created are all dynamically linked to raw adverse event data which allows the tool to work with data from any adverse event coding system. The charts are created using [D3](http://www.d3js.org "D3.js") and the interface is formatted with [Bootstrap](http://www.getbootstrap.com "Bootstrap").

##Background
Adverse events are undesirable experiences associated with the use of a medical product in a patient. The traditional method of reporting AEs in clinical trials is to provide detailed listings of every adverse event reported in a study. Medical monitors are tasked with reviewing these listings to monitor patient safety and search for complications with investigational products. Studies with large participant enrollment, severe diseases, complex treatments, or long protocols can lead to thousands of AEs and dozens of pages of listings. This method is inefficient and poses the risk that that clinically-relevant signals will be obscured by the sheer volume of events reported.

##Features
The AE Explorer contains all of the information available in standard listings, but we apply interactive elements common in website design to give users the ability to search the data. The default view is a single-screen display of AEs grouped by the MedDRA System Organ Class. Dot plots portray the incidence in the different treatment groups. Users can interact with the display in real time to:
- view confidence intervals for between-group differences
- expand the dataset to show nested preferred terms
- drill down to participant-specific data
- search by term of interest
- filter according to causality and severity
- select events based on a minimum incidence threshold (e.g., AEs with prevalence >5%)