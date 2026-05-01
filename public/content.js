let attempts = 0;
let lastClickTime = 0;
let viewedSolution = false;
let lastUrl = location.href;
let currentProblemName = getProblemName(location.href);
let solved = false;
let observer = null;
let startTime = currentProblemName ? Date.now() : null;
let startedSolving = false;
let awaitingResult = false;
let endTime = null;
let solutionViewedTime = null;
let totalTimeHidden = 0;
let lastHiddenTime = null;
let firstCodingTime = null;
function calculateScore() {
    let score = 100;
    const totalTime = (endTime - startTime) / 1000;
    if(!firstCodingTime){
        score -=50;
    }else{
        const codingDuration = (endTime - firstCodingTime) / 1000;
        if(codingDuration < 5 && totalTime > 15) {
            score -= 40;
        }
    }
    if (totalTime > 3600) {
        score -= 30; // Over an hour
        console.log("Time Penalty: Over 60 minutes (-30 points).");
    } else if (totalTime > 2700) {
        score -= 20; // Over 45 mins
        console.log("Time Penalty: Over 45 minutes (-20 points).");
    } else if (totalTime > 1800) {
        score -= 10; // Over 30 mins
        console.log("Time Penalty: Over 30 minutes (-10 points).");
    }
    if(viewedSolution && solutionViewedTime){
        const struggleTime = (solutionViewedTime - startTime) / 1000;
        const struggleRatio = struggleTime / totalTime;
        if(struggleRatio < 0.2) {
            score -= 60; 
        } else if(struggleRatio < 0.5) {
            score -= 40; 
        } else {
            score -= 20; 
        }
    }
    if(attempts > 1) {
        const penalty  = (attempts - 1) * 5;
        score -= penalty;
    }
    const awayRatio = totalTimeHidden / totalTime;
    if(awayRatio > 0.1) {
        const penal = Math.round(awayRatio * 50);
        score -= Math.min(penal, 40);//cap penalty to 40 points
        console.log("Time away penalty: " + penal + " points.");
    }
    return Math.max(score, 0);
}






function checkUrlChange() { // check if the URL has changed
    if(location.href !== lastUrl) {
        lastUrl = location.href;
        const newProblemName = getProblemName(lastUrl);
            if(newProblemName && currentProblemName && newProblemName !== currentProblemName) {
            attempts = 0;
            viewedSolution = false;
            solved = false;
            startTime = Date.now();
            startedSolving = false;
            solutionViewedTime = null;
            totalTimeHidden = 0;
            lastHiddenTime = null;
            firstCodingTime = null;
            currentProblemName = newProblemName;
            console.log("User has navigated to a new problem: " + newProblemName);
            }
        
        else if(solved === false && viewedSolution === false && (lastUrl.includes("/solutions/") || lastUrl.includes("/editorial/"))) {
            viewedSolution = true;
            solutionViewedTime = Date.now();
            console.log("User has viewd Solution");
            return;
        }
    }
}
function getProblemName(url) {
    const part = url.split("/problems/");
    if(part.length < 2) return null;
    const slug = part[1].split("/")[0];
    return slug || null;
}

function waitForResult() {
   const target = document.body;
   if(observer) {
    observer.disconnect();
    observer = null;
   }
   function checkNow() {
     const span = document.querySelector('[data-e2e-locator="submission-result"]');
     if(!awaitingResult) return false;
    if(span && span.innerText.trim() === "Accepted") {
        solved = true;
        endTime = Date.now();
        console.log("------Problem solved------");
        const finalScore = calculateScore();
        console.log("Confidence Score: " + finalScore);
        const timeTaken = ((endTime - startTime)/1000);
        console.log("Time taken to solve: " + timeTaken.toFixed(2) + " seconds.");
        let daysToAdd = 1;
        if(finalScore >= 90) daysToAdd = 10;
        else if(finalScore >= 70) daysToAdd = 5;
        else if(finalScore >= 40) daysToAdd = 2;
        const nextRevision = new Date();
        nextRevision.setDate(nextRevision.getDate() + daysToAdd);
        console.log("Next revision scheduled on: " + nextRevision.toDateString());

            const problemData = {
                id : currentProblemName,
                score: finalScore,
                timeTaken: timeTaken,
                attempts: attempts,
                solvedOn: Date.now(),
                nextRevision: nextRevision.getTime()
};
chrome.storage.local.get({leetcodeHistory: {}}, (result) => {
    let history = result.leetcodeHistory || {};
    history[currentProblemName] = problemData;
    chrome.storage.local.set({leetcodeHistory: history}, () => {
        console.log("Problem data saved to local storage.");
    });
});
awaitingResult = false;
console.log("Problem solved successfully!");
return true;
    }
    return false;
}
if(checkNow())return;
    observer = new MutationObserver(() => {
        if(checkNow()) {
        observer.disconnect();
        observer = null;
        }
});
    observer.observe(target, { 
        childList: true, subtree: true 
    });

}

document.addEventListener("click", e => {
    let el = e.target;
    while(el) {
        if(el.getAttribute && el.getAttribute("aria-label") === "Submit"){
            const now = Date.now();
            if(now - lastClickTime > 2000) {
            if(!solved){
            attempts++;
            awaitingResult = true;
            waitForResult();
            console.log("Total submit attempts: " + attempts);
            }
            lastClickTime = now;
            }
            return;
        }
        el = el.parentElement;
    }
});

document.addEventListener("keydown", e => {
    if(!startedSolving){
        const editor = document.querySelector(".monaco-editor");
        if(editor && document.activeElement.closest(".monaco-editor") === editor) {
            startedSolving = true;
            firstCodingTime = Date.now();
            console.log("Started solving the problem.");
    }
}
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden && startedSolving && !solved) {
        lastHiddenTime = Date.now();
    }else if(!document.hidden && lastHiddenTime !== null){
        const timeAway = (Date.now() - lastHiddenTime) / 1000;
        if(!solved){
            totalTimeHidden += timeAway;     
        }
        lastHiddenTime = null;
    }

});

setInterval(checkUrlChange, 1000); // cotinuously check for URL changes every second





 


