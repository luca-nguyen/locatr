'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

///////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const resetBtn = document.querySelector('.reset__btn');
const removeBtn = document.querySelectorAll('.close__btn');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Display reset button
    resetBtn.classList.remove('reset__btn--hidden');

    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    // Personal notes: 1st 'this' -> ensures class can reference own prototypes
    // 2nd 'this' -> sets 'this' to object created (in this case "App")
    form.addEventListener('submit', this._newWorkout.bind(this));
    resetBtn.addEventListener('click', this._resetButton.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    // closeBtn.addEventListener('click', this._closeWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._closeWorkout.bind(this));
    containerWorkouts.addEventListener(
      'dblclick',
      this._editWorkout.bind(this)
    );
  }

  _editWorkout(e) {
    const workout = e.target.closest('.workout');
    const targetID = workout.dataset.id;
    const field = e.target.closest('.workout__value');
    const existingValue = field.querySelector('p');
    const details = e.target.closest('.workout__details');
    const icon = details.querySelector('.workout__icon');

    let type;
    // Determine the type of value being edited
    if (icon.textContent === '⚡️') {
      type = 'pace';
    } else if (icon.textContent === '🦶🏼') {
      type = 'cadence';
    } else if (icon.textContent === '⏱') {
      type = 'duration';
    } else if (icon.textContent === '⛰') {
      type = 'elevationGain';
    } else if (icon.textContent === '🏃‍♂️' || icon.textContent === '🚴‍♀️') {
      type = 'distance';
    }

    const unit = details.querySelector('.workout__unit');
    const editField = field.querySelector('.edit__value');
    console.log(editField);
    editField.classList.remove('hidden');
    unit.classList.add('hidden');
    editField.focus();

    // Existing edit by clicking outside || pressing escape
    document.addEventListener('click', function () {
      editField.classList.add('hidden');
      unit.classList.remove('hidden');
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        editField.classList.add('hidden');
        unit.classList.remove('hidden');     
      }
    })


    editField.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        editField.classList.add('hidden');
        unit.classList.remove('hidden');
        existingValue.textContent = editField.value;

        // Update the workout object in the array
        const workout = this.#workouts.find(workout => workout.id === targetID);
        workout[type] = +editField.value;
        // Personal notes: [] square brackets used to dynamically access
        // property of object using another variable

        // Save the updated workouts array to local storage
        this._setLocalStorage();
      }
    });
  }

  _resetButton() {
    if (this.#workouts.length === 0) return;
    localStorage.removeItem('workouts');
    location.reload();
    resetBtn.classList.add('reset__btn--hidden');
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();

    // IMPLEMENTED
    // Personal notes: event listener added to document to await key press
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        console.log('yay');
        this._hideForm();
      }
    });
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();

    console.log(this.#workouts);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <div class="workout__title--container">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="close__btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#868e96"
                class="close__btn--icon">
                <path
                  d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"
                ></path>
              </svg>
            </div>
          </div>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">
            <p>${workout.distance}</p>
            <input class="edit__value  hidden"/>
          </span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">
            <p>${workout.duration}</p>
            <input class="edit__value hidden"/>
          </span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">
            <p>${workout.pace.toFixed(1)}</p>
            <input class="edit__value hidden"/>
          </span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">
            <p>${workout.cadence}</p>
            <input class="edit__value hidden"/>
          </span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">
            <p>${workout.speed.toFixed(1)}</p>
            <input class="edit__value hidden"/>
          </span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">
            <p>${workout.elevationGain}</p>
            <input class="edit__value hidden"/>
          </span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  // IMPLEMENTED
  _closeWorkout(e) {
    // Making sure button is pressed
    const button = e.target.closest('.close__btn');
    if (!button) return;
    console.log(button);

    // Finding parent element of button
    const workoutEl = button.closest('.workout');
    const closeID = workoutEl.dataset.id;
    console.log(workoutEl);

    // Remove workout!
    // Filtering workouts array of instance to exclude clicked workout
    this.#workouts = this.#workouts.filter(workout => workout.id != closeID);
    // Hiding workout & reallocating memory to local storage
    workoutEl.classList.add('hidden');

    this._setLocalStorage();


  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
