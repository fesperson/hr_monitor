const connectButton = document.querySelector(".connect")
const errorTxt = document.querySelector(".error")
const connectUI = document.querySelector(".connect-ui")
const UI = document.querySelector(".ui")
const bpm = document.querySelector(".bpm")

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

connectButton.addEventListener("click", init)