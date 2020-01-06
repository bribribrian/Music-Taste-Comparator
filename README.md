# Music-Taste-Comparator
A data visualizer for comparing taste between two Spotify users
## Overview
Music-Taste-Comparator is a data visualization and recomendation generator that takes in a current user and another inputed username. Using the Spotify API, data is retrieved on the current user which is used to create a visualization of their top artists, tracks, genres, etc. Using the inputed username, the Spotify API will fetch the public playlists of that username and that data will be used to make a comparison of the comonalities and differences between the 2 users in order so show how much they have in common and what artists or tracks the current user might be interested in that do not show in the current users data.
## Functionality
The user will log in to their account setting them as the current user. This gives access to all of their Spotify data through the API. This will generate a visualization of all their top artists, tracks, genres, and relevant information. The user will input a username of one of their friends or a user they follow. This will then generate a data visualization of any public information that user is allowing access to. Based on that data, a visualization will be generated representing the comonalities and differences between those two users. A recommended list of artists and tracks will be generated based on top tracks of the inputed user that the current user will be able to either keep or reject at their own discretion and the current user will now have a list of recomended songs that is coming from the inputed users data.
## MVPs
- Users will be able to log in and view their spotify data.
- Users will be able to enter a known username of a friend or followed account and view their public data
- Users will be able to view a comparative data visualization 
- Users will be able to view a list of songs/artists that appear in the inputed users data and not their own
- Users will be able to edit the list of songs/artits so they can currate a list of songs/artists to discover
## Wire Frame
The page consists of a single screen showing the current_user spotify username, an input for the searched username, a datavisualization of their compared data, and a list of suggested tracks based on the compared data.
![Wire Frame](https://ootd-dev.s3.amazonaws.com/Wire_frame_2.png)
## Technologies
- JavaScript
  - Vanilla JavaScript
  - Basis of entire project
- Spotify API
  - Used to get relevant data for current_user and input_user
- D3.js
  - Used for data visualization and user experience
## Implementation Timeline
 - Day 1:
   - Integrate Spotify API
   - Integrate D3
 - Day 2:
   - Make get request for current_user
   - Visualize current_user data
 - Day 3:
   - Make get requet for input user_name
   - Visualize compared data
 - Day 4:
   - Compared data suggests tracks
   - Finalize display
