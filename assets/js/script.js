let currentFloor = 0;

let interiorsByFloor = {
    0: 'recepcao.png',
    1: 'andar1.png',
    2: 'andar2.png',
    3: 'andar3.png',
}

let elevatorIsMoving = false;

let nextFloors = [];

function openCloseDoors() {
    return new Promise(resolve => {
        const door1 = document.querySelector(".door-part1");
        const door2 = document.querySelector(".door-part2");

        // checks if the door1 and door2 are already open
        let audio;
        if (door1.classList.contains("door-open") && door2.classList.contains("door-open")) {
            audio = new Audio('./assets/audios/door_close.mp3'); // Relative path
        } else {
            audio = new Audio('./assets/audios/door_open.mp3'); // Relative path
        }
        audio.play();
        audio.volume = 0.5;
        audio.loop = false;
        audio.currentTime = 0;

        door1.classList.toggle("door-open");
        door2.classList.toggle("door-open");
        setTimeout(() => {
            resolve();
        }, 2000);
    })
}

function setBtnActive(floor) {
    const btn = document.querySelector(`.btn-floor-${floor}`);
    btn.classList.add('active-btn');
}

function setBtnInactive(floor) {
    const btn = document.querySelector(`.btn-floor-${floor}`);
    btn.classList.remove('active-btn');
}

function playAudio(type, volume) {
    const soundsPaths = {
        'btnClick': './assets/audios/btn_click.mp3',
        'elevatorBell': './assets/audios/elevator_bell.mp3'
    }
    const audio = new Audio(soundsPaths[type]);
    audio.play();
    audio.volume = volume;
    audio.loop = false;
    audio.currentTime = 0;
}

function setArrowActive(isGoingUp)
{
    const arrowPositionIndicator = document.querySelector('.arrow-position-indicator');
    const arrowLight = arrowPositionIndicator.querySelector('.arrow-position-indicator-light');
    if (isGoingUp) {
        arrowPositionIndicator.style.animation = 'arrowAnimation 2s linear infinite';
        arrowPositionIndicator.style.transform = 'rotate(270deg)';
    } else {
        arrowPositionIndicator.style.transform = 'rotate(90deg)';
        arrowPositionIndicator.style.animation = 'arrowAnimation 2s linear infinite reverse';
    }
    arrowLight.classList.add('arrow-light-on');
    arrowLight.classList.remove('arrow-light-off');
}

function setArrowInactive() {
    const arrowPositionIndicator = document.querySelector('.arrow-position-indicator');
    arrowPositionIndicator.style.animation = 'none';
    const arrowLight = arrowPositionIndicator.querySelector('.arrow-position-indicator-light');
    arrowLight.classList.remove('arrow-light-on');
    arrowLight.classList.add('arrow-light-off');
}

async function changeFloor(floor) {
    if (currentFloor === floor) {
        return;
    }

    playAudio('btnClick', 0.4);
    setBtnActive(floor);

    if (elevatorIsMoving) {
        return nextFloors.push(floor);
    }
    elevatorIsMoving = true;

    await openCloseDoors();

    const isGoingUp = (floor > currentFloor ? true: false);
    const difference = Math.abs(currentFloor - floor);

    setArrowActive(isGoingUp);

    const interior = document.querySelector('.interior');
    interior.style.backgroundImage = `url('./assets/imgs/interiors/${interiorsByFloor[floor]}')`;

    // Se deslocando ate o andar
    await new Promise(resolve => {
        const floorIndicator = document.querySelector('.position-indicator .floor');
        let floorNow = currentFloor;
        const elevatorMoving = setInterval(() => {
            floorNow += (isGoingUp ? 1 : -1);
            floorIndicator.innerText = (floorNow === 0 ? "T" : floorNow);
            console.log('floorNow ' + floorNow);
            console.log('difference: ' + difference);

            if (floorNow === floor) {
                clearInterval(elevatorMoving);
                resolve();
            }
        }, 900 * difference)
    });

    setArrowInactive();
    setBtnInactive(floor);

    elevatorIsMoving = false;
    playAudio('elevatorBell', 1);
    await openCloseDoors();
    currentFloor = floor;

    new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 1200 * (currentFloor - floor));
    })
    nextFloors.sort((a, b) => a - b);

    for (let i = 0; i < nextFloors.length; i++) {
        changeFloor(nextFloors[i]);
        nextFloors.splice(i, 1);
    }
}