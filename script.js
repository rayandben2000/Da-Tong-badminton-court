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

const start_times = []; // '8' means eight to nine in the morning 
const date = ''; // example format 1991/09/18

if (!start_times || !date) {
    console.error('need modify start_time & date');
} else {
    courts.map(court => {
        start_times.map(start_time => {
            fetch(
                `https://bwd.xuanen.com.tw/wd02.aspx?module=net_booking&files=booking_place&StepFlag=25&QPid=${court}&QTime=${start_time}&PT=1&D=${date}`
            )
            .then(res => console.log(res.status));
        });
    });
}
