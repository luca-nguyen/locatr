# Locatr

![Screenshot of app](/images/locatr_sample.png)

The Locatr web app is a dynamic fitness tracker that integrates geolocation to center a customisable map on the user's position. Users can log running and cycling workouts with auto-calculated metrics, edit details, and view entries in a detailed list format or on the map via custom markers. The app features persistent data storage with localStorage, form validation, and a responsive design. 

## Technical Stack
- Frontend: JavaScript (ES6+)
- Map Integration: Leaflet.js
- Styling: CSS3 with custom properties
- Storage: Browser LocalStorage API
- Geolocation: Browser Geolocation API

## Technical Implementation Details
| Feature | Description |
|---------|-------------|
| Geolocation Integration | Utilises the browser's geolocation API to fetch and track user position. Automatically centers the map on the user's location when the application loads. |
| Interactive Map Display | Implements Leaflet.js for dynamic map rendering and interaction. Allows users to click anywhere on the map to add new workout markers, with custom styling for different workout types. |
| Form Management | Features a dynamic form interface that toggles between running and cycling inputs. Implements form validation for numeric inputs and positive values. |
| Workout Editing | Enables in-place editing of workout details through double-click interaction. Users can modify distance, duration, cadence, or elevation gain. Updates are reflected immediately in the UI and persisted to storage. |
| Local Storage | Implements persistent storage of workout data using browser's localStorage API. Automatically saves workouts and restores them when the application reloads. Includes functionality to reset all stored data. |
| Delete Operations | Features the ability to remove individual workouts through a delete button. Updates both the UI and stored data when workouts are removed. |
| Reset Functionality | Includes a reset button to clear all workout data and return the application to its initial state. Removes all markers, stored data, and resets the map view. |

## How to use
1. Allow web app to access user location.

![Screenshot of app](/images/locatr_location.png)
   
3. Click anywhere on the map to open a new input form for adding a workout.

![Screenshot of app](/images/locatr_click.png)
  
5. Choose either "Running" or "Cycling" and complete the form with the required workout details.

![Screenshot of app](/images/locatr_create.png)
  
7. Press the Enter key to save the workout and log it on the map.
8. To hide workout details, click the "X" icon on the pop-up displayed on the map marker.
Use the red reset button to clear all logged workouts and reset the application.
