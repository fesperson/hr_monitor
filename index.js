const connectButton = document.querySelector(".connect")
const errorTxt = document.querySelector(".error")
const connectUI = document.querySelector(".connect-ui")
const UI = document.querySelector(".ui")
const bpm = document.querySelector(".bpm")
const stopButton = document.querySelector(".stop")
const startButton = document.querySelector(".start")


let device;
let heartRateChar;

async function requestDevice() {
    device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["heart_rate"],
    })

    device.addEventListener("gattserverdisconnected", connectDevice)
}

function handleRateChange(event) {
    value = parseHR(event.target.value)
    console.log(value)
    bpm.textContent = value

    updateChart(value)
}
async function connectDevice() {
    if(device.gatt.connected) return;

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("heart_rate")

    heartRateChar = await service.getCharacteristic('heart_rate_measurement')
    heartRateChar.addEventListener('characteristicvaluechanged', handleRateChange)
    await startMonitoring()
}

function pauseBPM() {
    UI.classList.add("hide")
    connectUI.classList.remove("hide")
    chart.render()
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
var start = Date.now()
var updateInterval = 100

// chart creation
window.onload = function () {
    createChart()
};

createChart = function () {
  // var dps = [{x: 1, y: 10}, {x: 2, y: 13}, {x: 3, y: 18}, {x: 4, y: 20}, {x: 5, y: 17},{x: 6, y: 10}, {x: 7, y: 13}, {x: 8, y: 18}, {x: 9, y: 20}, {x: 10, y: 17}];   //dataPoints. 
    

  chart = new CanvasJS.Chart("chartContainer",{
    title :{
        text: "Heart Rate Graph",
        fontFamily: "arial"
    },
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


var updateChart = function (hr) {
       
    
    dps.push({x: (Date.now() - start)/1000,y: hr});
    // if (dps.length >  10 )
    // {
    //     dps.shift();				
    // }

    chart.render();		

}

startButton.addEventListener('click', restartBPM)
stopButton.addEventListener('click', pauseBPM)
connectButton.addEventListener("click", init)