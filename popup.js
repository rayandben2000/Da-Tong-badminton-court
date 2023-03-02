const reserveDate = document.getElementById("reserveDate");
const reserveTime = document.getElementById("reserveTime");
const reserveButton = document.getElementById("reserveButton");
const message = document.getElementById("msg");

const reserve = (date, startTimes) =>{
    const courts = [
        1112, // 5-1
        1113, // 5-2
        1114, // 5-3
        1115, // 5-4
        1116, // 5-5
        1163, // 5-6
        1164, // 5-7
        1165, // 5-8
        1166, // 5-9
    ];

    if (!startTimes || !date) {
        console.error('date & startTimes are required.');
        return;
    } else {
        courts.map(court => {
            startTimes.map(startTime => {
                fetch(
                    `https://bwd.xuanen.com.tw/wd02.aspx?module=net_booking&files=booking_place&StepFlag=25&QPid=${court}&QTime=${startTime}&PT=1&D=${date}`
                );
            });
        });

    }
};

async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Set reserve date interval
const today = new Date();
const eightDay = new Date();
eightDay.setDate(today.getDate() + 8);
reserveDate.setAttribute("min", today.toISOString().split("T")[0]);
reserveDate.setAttribute("max", eightDay.toISOString().split("T")[0]);

// Set button handler
reserveButton.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    const startHours = reserveTime.value.split(',')
        .map(value => parseInt(value))
        .filter(num => (num > 4 && num < 22));
    if (startHours.length <= 0) {
        message.innerHTML = "Reservation start time is invalid.";
        return;
    }

    if (!reserveDate.value) {
        message.innerHTML = "Reservation date is invalid.";
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reserve,
        args: [reserveDate.value, startHours]
    });

    message.innerHTML = "Done";
});