const connectButton = document.getElementById("connect")
const errorTxt = document.querySelector(".error")
const connectUI = document.querySelector(".connect-ui")
const UI = document.querySelector(".ui")
const bpm = document.querySelector(".bpm")
const pauseButton = document.getElementById("pause")
const startButton = document.getElementById("start")
const bpmAvg = document.querySelector(".bpmAvg")


let device;
let heartRateChar;
let isPaused=true;
let hrList = [0, 0];

async function requestDevice() {
    device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["heart_rate"],
    })

    device.addEventListener("gattserverdisconnected", connectDevice)
}

function handleRateChange(event) {
    if (!isPaused) {
        value = parseHR(event.target.value)
        console.log(value)
        bpm.textContent = value
        updateChart(value)

        hrList[0] += value;
        hrList[1] += 1;
        avg = hrList[0] / hrList[1]
        bpmAvg.textContent = Number( avg.toPrecision(3) )
    }
}
async function connectDevice() {
    if(device.gatt.connected) return;

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("heart_rate")

    heartRateChar = await service.getCharacteristic('heart_rate_measurement')
    heartRateChar.addEventListener('characteristicvaluechanged', handleRateChange)
    await startMonitoring()
}


function parseHR(value) {
    const is16Bits = value.getUint8(0) & 0x1;
    if(is16Bits) return value.getUint16(1, true)
    else return value.getUint8(1)
}

async function startMonitoring() {
    await heartRateChar.startNotifications()
}

async function init(params) {
    if(!navigator.bluetooth) return errorTxt.classList.remove("hide")
    await requestDevice();
    connectButton.textContent = 'connecting...'
    
    await connectDevice();
    connectUI.classList.add("hide")
    UI.classList.remove("hide")

}

var dps = []
var chart;
var start = Date.now();
var updateInterval = 100

// chart creation
window.onload = function () {
    createChart()
};

createChart = function () {
  chart = new CanvasJS.Chart("chartContainer",{
        axisX: {						
            title: "Seconds"
        },
        axisY: {						
            title: "BPM"
        },
        data: [{
            type: "line",
            dataPoints : dps
        }]
    });

    chart.render();
    // update chart after specified time. 
}

var restartBPM = function() {
    dps = []
    createChart()
}

var pauseBPM = function() {
    console.log("pausing")
    if (isPaused) {
        isPaused = false;
        pauseButton.textContent = "pause"
        pauseButton.classList.add("pause-button")
    }
    else {
        isPaused = true;
        pauseButton.textContent = "start"
        pauseButton.classList.add("start-button")
    }

}


var updateChart = function (hr) {
       
    
    dps.push({x: (Date.now() - start)/1000,y: hr});
    // if (dps.length >  10 )
    // {
    //     dps.shift();				
    // }
    
    chart.render();		

}

connectButton.addEventListener("click", init);
startButton.addEventListener('click', restartBPM);
pauseButton.addEventListener('click', pauseBPM);
