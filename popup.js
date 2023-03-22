window.onload = function () {
    const reserveDate = document.getElementById("reserveDate");
    const reserveTime = document.getElementById("reserveTime");
    const reserveButton = document.getElementById("reserveButton");
    const message = document.getElementById("msg");

    const SetMsg = (msg, isError) => {
        message.style.color = isError ? "red" : "black";
        message.innerHTML = msg;
    };

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

        return { resultMsg, isError: resultMsg != 'Done' };
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
            SetMsg("You must at Da-Tong Sport center page.", true);
            return;
        }

        const startHours = reserveTime.value.split(',')
            .map(value => parseInt(value))
            .filter(num => (num > 4 && num < 22));
        if (startHours.length <= 0) {
            SetMsg("Reservation start time is invalid.", true);
            return;
        }

        if (!reserveDate.value) {
            SetMsg("Reservation date is invalid.", true);
            return;
        }

        SetMsg("Reserving...", false);
        disabledAllFields(true);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: reserve,
            args: [reserveDate.value, startHours]
        }).then(injectionResults => {
            SetMsg(injectionResults[0].result.resultMsg, injectionResults[0].result.isError);
            disabledAllFields(false);
        });
    });
}