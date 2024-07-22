document.addEventListener('DOMContentLoaded', () => {
    const users = { nasa: "daddyelon" };
    const departments = [
        "Flight Director",
        "Launch Director",
        "Flight Dynamics Officer (FDO)",
        "Guidance, Navigation, and Control (GNC)",
        "Propulsion Systems Engineer",
        "Electrical Systems Engineer",
        "Communications Engineer",
        "Environmental and Thermal Engineer",
        "Life Support Systems Engineer",
        "Payload Operations",
        "Safety and Mission Assurance",
        "Range Safety Officer",
        "Weather Officer",
        "Recovery and Rescue Teams"
    ];
    const criticalDepartments = new Set(["Flight Director", "Launch Director"]);
    let responses = {};
    let currentIndex = 0;
    let authenticated = false;
    let currentUser = "";

    const loginContainer = document.getElementById('login-container');
    const pollContainer = document.getElementById('poll-container');
    const reviewContainer = document.getElementById('review-container');
    const adminContainer = document.getElementById('admin-container');

    document.getElementById('login-button').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (users[username] && users[username] === password) {
            authenticated = true;
            currentUser = username;
            loginContainer.style.display = 'none';
            pollContainer.style.display = 'block';
            updateDepartmentLabel();
        } else {
            alert("Invalid username or password");
        }
    });

    document.getElementById('submit-button').addEventListener('click', () => {
        const response = document.getElementById('response-input').value.toUpperCase();
        const comment = document.getElementById('comment-input').value;
        if (response === 'G' || response === 'NG') {
            recordResponse(departments[currentIndex], response, comment);
            document.getElementById('response-input').value = "";
            document.getElementById('comment-input').value = "";
            currentIndex++;
            updateDepartmentLabel();
            updateStatus();
        } else {
            alert("Please enter 'G' or 'NG'.");
        }
    });

    document.getElementById('review-button').addEventListener('click', () => {
        reviewContainer.style.display = 'block';
        pollContainer.style.display = 'none';
        const responsesList = document.getElementById('responses-list');
        responsesList.innerHTML = '';
        for (const dept in responses) {
            const item = `${dept}: ${responses[dept].response} - ${responses[dept].comment} (at ${responses[dept].timestamp})`;
            const responseItem = document.createElement('p');
            responseItem.innerText = item;
            responsesList.appendChild(responseItem);
        }
    });

    document.getElementById('close-review-button').addEventListener('click', () => {
        reviewContainer.style.display = 'none';
        pollContainer.style.display = 'block';
    });

    document.getElementById('save-button').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(responses)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poll_results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Results saved successfully.");
    });

    document.getElementById('load-button').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', () => {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                responses = JSON.parse(reader.result);
                alert("Results loaded successfully.");
                reviewContainer.style.display = 'block';
                pollContainer.style.display = 'none';
                const responsesList = document.getElementById('responses-list');
                responsesList.innerHTML = '';
                for (const dept in responses) {
                    const item = `${dept}: ${responses[dept].response} - ${responses[dept].comment} (at ${responses[dept].timestamp})`;
                    const responseItem = document.createElement('p');
                    responseItem.innerText = item;
                    responsesList.appendChild(responseItem);
                }
            };
            reader.readAsText(file);
        });
        input.click();
    });

    document.getElementById('export-button').addEventListener('click', () => {
        let csvContent = "Department,Response,Comment,Timestamp\n";
        for (const dept in responses) {
            csvContent += `${dept},${responses[dept].response},${responses[dept].comment},${responses[dept].timestamp}\n`;
        }
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poll_results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Results exported successfully.");
    });

    document.getElementById('recommendation-button').addEventListener('click', () => {
        const recommendation = getRecommendation();
        alert(recommendation);
    });

    document.getElementById('admin-button').addEventListener('click', () => {
        const username = prompt("Enter admin username:");
        const password = prompt("Enter admin password:");
        if (users[username] && users[username] === password) {
            adminContainer.style.display = 'block';
            pollContainer.style.display = 'none';
        } else {
            alert("Invalid username or password");
        }
    });

    document.getElementById('add-department-button').addEventListener('click', () => {
        const newDepartment = document.getElementById('new-department').value;
        if (newDepartment && !departments.includes(newDepartment)) {
            departments.push(newDepartment);
            alert(`${newDepartment} added successfully.`);
        } else {
            alert("Invalid department name or department already exists.");
        }
    });

    document.getElementById('remove-department-button').addEventListener('click', () => {
        const removeDepartment = document.getElementById('remove-department').value;
        const index = departments.indexOf(removeDepartment);
        if (index !== -1) {
            departments.splice(index, 1);
            criticalDepartments.delete(removeDepartment);
            alert(`${removeDepartment} removed successfully.`);
        } else {
            alert("Department not found.");
        }
    });

    document.getElementById('toggle-critical-button').addEventListener('click', () => {
        const department = document.getElementById('critical-department').value;
        if (departments.includes(department)) {
            if (criticalDepartments.has(department)) {
                criticalDepartments.delete(department);
                alert(`${department} is no longer critical.`);
            } else {
                criticalDepartments.add(department);
                alert(`${department} is now critical.`);
            }
        } else {
            alert("Department not found.");
        }
    });

    document.getElementById('change-credentials-button').addEventListener('click', () => {
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;
        if (newUsername && newPassword) {
            users[newUsername] = newPassword;
            alert("Username and password changed successfully.");
        } else {
            alert("Username or password cannot be empty.");
        }
    });

    document.getElementById('rerun-poll-button').addEventListener('click', () => {
        responses = {};
        currentIndex = 0;
        document.getElementById('response-input').disabled = false;
        document.getElementById('comment-input').disabled = false;
        document.getElementById('submit-button').disabled = false;
        updateDepartmentLabel();
        updateStatus();
        alert("The poll has been reset.");
    });

    document.getElementById('signout-button').addEventListener('click', () => {
        authenticated = false;
        currentUser = "";
        pollContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    function updateDepartmentLabel() {
        if (currentIndex < departments.length) {
            document.getElementById('department-label').innerText = departments[currentIndex];
        } else {
            document.getElementById('department-label').innerText = "All departments have been asked.";
            document.getElementById('response-input').disabled = true;
            document.getElementById('comment-input').disabled = true;
            document.getElementById('submit-button').disabled = true;
            updateStatus();
        }
    }

    function recordResponse(department, response, comment) {
        responses[department] = {
            response: response,
            comment: comment,
            timestamp: new Date().toISOString()
        };
    }

    function updateStatus() {
        const goCount = Object.values(responses).filter(r => r.response === 'G').length;
        const ngCount = Object.values(responses).filter(r => r.response === 'NG').length;
        const statusStr = `Current Status: ${goCount} Go, ${ngCount} No-Go`;
        document.getElementById('status-label').innerText = statusStr;
    }

    function calculatePercentage() {
        const goCount = Object.values(responses).filter(r => r.response === 'G').length;
        const totalCount = Object.keys(responses).length;
        return (goCount / totalCount) * 100 || 0;
    }

    function getRecommendation() {
        const percentage = calculatePercentage();
        const ngCount = Object.values(responses).filter(r => r.response === 'NG').length;
        const criticalNg = Array.from(criticalDepartments).some(dept => responses[dept]?.response === 'NG');

        if (percentage === 100) {
            return "Launch Approved: 100% Go";
        } else if (percentage >= 95 && ngCount <= 1 && !criticalNg) {
            return "Launch Likely: >95% Go";
        } else if (percentage >= 90 && ngCount <= 2 && !criticalNg) {
            return "Launch Possible: 90-95% Go";
        } else {
            return "Launch Not Recommended: <90% Go or critical department No-Go";
        }
    }
});
