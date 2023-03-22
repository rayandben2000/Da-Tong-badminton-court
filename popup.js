const reserveDate = document.getElementById("reserveDate");
const reserveTime = document.getElementById("reserveTime");
const reserveButton = document.getElementById("reserveButton");
const message = document.getElementById("msg");

const reserve = async (date, startTimes) => {
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

    let resultMsg = 'Done';
    if (!startTimes || !date) {
        console.error('date & startTimes are required.');
        return 'date & startTimes are required.';
    } else {
        await Promise.all(courts.map(async court => {
            await Promise.all(startTimes.map(async startTime => {
                const response = await fetch(
                    `https://bwd.xuanen.com.tw/wd02.aspx?module=net_booking&files=booking_place&StepFlag=25&QPid=${court}&QTime=${startTime}&PT=1&D=${date}`
                );
                if (response.url.indexOf("login") != -1) {
                    await Promise.reject("You must login first.");
                }
            }));
        })).catch(err => {
            resultMsg = err;
        });
    }

    return resultMsg;
};

const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

const disabledAllFields = (disabled) => {
    reserveDate.disabled = disabled;
    reserveTime.disabled = disabled;
    reserveButton.disabled = disabled;
};

// Set reserve date interval
const today = new Date();
const eightDay = new Date();
eightDay.setDate(today.getDate() + 8);
reserveDate.setAttribute("min", today.toISOString().split("T")[0]);
reserveDate.setAttribute("max", eightDay.toISOString().split("T")[0]);

// Set button handler
reserveButton.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab.url.startsWith("https://bwd.xuanen.com.tw/wd02.aspx")) {
        message.innerHTML = "You must at Da-Tong Sport center page.";
        return;
    }

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

    message.innerHTML = "Reserving...";
    disabledAllFields(true);

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reserve,
        args: [reserveDate.value, startHours]
    }).then(injectionResults => {
        message.innerHTML = injectionResults[0].result
        disabledAllFields(false);
    });
});