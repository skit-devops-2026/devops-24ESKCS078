var startingRoutines = [
    {
        id: 1,
        icon: "🧠",
        name: "Deep Work Block",
        time: "09:00",
        difficulty: "hard",
        trigger: "After I pour my morning coffee, I open the editor.",
        micro: "Open the file and write one line."
    },
    {
        id: 2,
        icon: "🏃",
        name: "Move The Body",
        time: "17:30",
        difficulty: "medium",
        trigger: "After I close my laptop, I put my shoes on.",
        micro: "Do 10 push ups."
    },
    {
        id: 3,
        icon: "📖",
        name: "Read 10 Pages",
        time: "21:00",
        difficulty: "easy",
        trigger: "After I get in bed, I pick up the book instead of my phone.",
        micro: "Read one page."
    },
    {
        id: 4,
        icon: "📝",
        name: "Evening Review",
        time: "22:00",
        difficulty: "easy",
        trigger: "After I brush my teeth, I write 3 lines about the day.",
        micro: "Write one sentence."
    }
];

function getToday() {
    return dateToText(new Date());
}

function dateToText(d) {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    if (month < 10) { month = "0" + month; }
    if (day < 10) { day = "0" + day; }
    return year + "-" + month + "-" + day;
}

function getRoutines() {
    var saved = localStorage.getItem("optiroutine_routines");
    if (saved == null) {
        var fresh = JSON.parse(JSON.stringify(startingRoutines));
        localStorage.setItem("optiroutine_routines", JSON.stringify(fresh));
        return fresh;
    }
    return JSON.parse(saved);
}

function saveRoutines(list) {
    localStorage.setItem("optiroutine_routines", JSON.stringify(list));
}

function getHistory() {
    var saved = localStorage.getItem("optiroutine_history");
    if (saved == null) {
        var fake = makeStarterHistory();
        localStorage.setItem("optiroutine_history", JSON.stringify(fake));
        return fake;
    }
    return JSON.parse(saved);
}

function saveHistory(history) {
    localStorage.setItem("optiroutine_history", JSON.stringify(history));
}

function getEnergy() {
    var saved = localStorage.getItem("optiroutine_energy");
    if (saved == null) {
        return {};
    }
    return JSON.parse(saved);
}

function saveEnergy(energy) {
    localStorage.setItem("optiroutine_energy", JSON.stringify(energy));
}

function getTodayEnergy() {
    var energy = getEnergy();
    if (energy[getToday()] == undefined) {
        return "medium";
    }
    return energy[getToday()];
}

function makeStarterHistory() {
    var history = {};
    for (var i = 14; i >= 1; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var doneIds = [];
        for (var j = 0; j < startingRoutines.length; j++) {
            var chance = 0.55;
            if (startingRoutines[j].difficulty == "easy") { chance = 0.85; }
            if (startingRoutines[j].difficulty == "medium") { chance = 0.7; }
            if (Math.random() < chance) {
                doneIds.push(startingRoutines[j].id);
            }
        }
        history[dateToText(d)] = doneIds;
    }
    return history;
}

function getDoneToday() {
    var history = getHistory();
    if (history[getToday()] == undefined) {
        return [];
    }
    return history[getToday()];
}

function isDone(id) {
    var done = getDoneToday();
    return done.indexOf(id) > -1;
}

function toggleDone(id) {
    var history = getHistory();
    var done = getDoneToday();
    var spot = done.indexOf(id);
    if (spot > -1) {
        done.splice(spot, 1);
    } else {
        done.push(id);
    }
    history[getToday()] = done;
    saveHistory(history);
}

function removeFromHistory(id) {
    var history = getHistory();
    for (var key in history) {
        var day = history[key];
        var spot = day.indexOf(id);
        while (spot > -1) {
            day.splice(spot, 1);
            spot = day.indexOf(id);
        }
    }
    saveHistory(history);
}

function dayIsGood(dateText) {
    var history = getHistory();
    var routines = getRoutines();
    if (routines.length == 0) { return false; }
    if (history[dateText] == undefined) { return false; }
    var needed = Math.ceil(routines.length / 2);
    return history[dateText].length >= needed;
}

function getStreak() {
    var streak = 0;
    var d = new Date();

    if (dayIsGood(dateToText(d)) == false) {
        d.setDate(d.getDate() - 1);
    }

    while (dayIsGood(dateToText(d)) == true) {
        streak = streak + 1;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

function getBestStreak() {
    var best = 0;
    var running = 0;
    for (var i = 60; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        if (dayIsGood(dateToText(d)) == true) {
            running = running + 1;
            if (running > best) { best = running; }
        } else {
            running = 0;
        }
    }
    return best;
}

function getTotalCompleted() {
    var history = getHistory();
    var total = 0;
    for (var key in history) {
        total = total + history[key].length;
    }
    return total;
}

function getConsistency(days) {
    var good = 0;
    for (var i = 0; i < days; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        if (dayIsGood(dateToText(d)) == true) {
            good = good + 1;
        }
    }
    return Math.round((good / days) * 100);
}

function makeNudge() {
    var routines = getRoutines();
    var energy = getTodayEnergy();
    var hour = new Date().getHours();
    var streak = getStreak();

    var next = null;
    for (var i = 0; i < routines.length; i++) {
        if (isDone(routines[i].id) == false) {
            next = routines[i];
            break;
        }
    }

    if (next == null) {
        return {
            title: "Every routine is closed out today ✅",
            text: "Nothing left to nudge you about. Your streak is safe at " + streak + " days.",
            action: "Nice"
        };
    }

    var nudge = {};

    if (energy == "low") {
        nudge.title = "Low energy detected — shrinking the task";
        nudge.text = "\"" + next.name + "\" is too big for right now. Do the micro version instead: " + next.micro;
        nudge.action = "Do the 5 minute version";
    } else if (streak >= 3) {
        nudge.title = "You have a " + streak + " day streak on the line";
        nudge.text = "Skipping \"" + next.name + "\" today is what breaks it. " + next.trigger;
        nudge.action = "Protect the streak";
    } else if (hour >= 20) {
        nudge.title = "The day is almost gone";
        nudge.text = "\"" + next.name + "\" is still open. Even the micro version counts: " + next.micro;
        nudge.action = "Save the day";
    } else {
        nudge.title = "Next up: " + next.name;
        nudge.text = next.trigger;
        nudge.action = "Start now";
    }
    return nudge;
}

function safeText(text) {
    if (text == undefined || text == null) {
        return "";
    }
    return String(text).split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}

function difficultyColour(difficulty) {
    if (difficulty == "hard") {
        return "bg-red-500/20 text-red-300";
    }
    if (difficulty == "medium") {
        return "bg-yellow-500/20 text-yellow-300";
    }
    return "bg-green-500/20 text-green-300";
}

function niceTime(time) {
    if (time == undefined || time.indexOf(":") < 0) {
        return "anytime";
    }
    var bits = time.split(":");
    var hour = parseInt(bits[0]);
    var mins = bits[1];
    var ending = "AM";
    if (hour >= 12) { ending = "PM"; }
    if (hour > 12) { hour = hour - 12; }
    if (hour == 0) { hour = 12; }
    return hour + ":" + mins + " " + ending;
}

function shortDayName(d) {
    var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return names[d.getDay()];
}

