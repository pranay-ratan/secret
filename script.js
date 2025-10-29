// Student Verifier Application Logic

class StudentVerifier {
    constructor() {
        this.students = [];
        this.verifiedStudents = new Set();
        this.quorumRequirement = 50; // Default quorum

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // File upload elements
        this.csvUpload = document.getElementById('csvUpload');
        this.fileName = document.getElementById('fileName');

        // Camera elements
        this.cameraScanBtn = document.getElementById('cameraScanBtn');
        this.cameraModal = document.getElementById('cameraModal');
        this.closeCameraBtn = document.getElementById('closeCameraBtn');
        this.cameraFeed = document.getElementById('cameraFeed');
        this.captureBtn = document.getElementById('captureBtn');
        this.cameraCanvas = document.getElementById('cameraCanvas');

        // Search elements
        this.studentSearch = document.getElementById('studentSearch');
        this.searchResults = document.getElementById('searchResults');
        this.idScanner = document.getElementById('idScanner');

        // Display elements
        this.verifiedStudentsDiv = document.getElementById('verifiedStudents');
        this.quorumCount = document.getElementById('quorumCount');
        this.quorumProgress = document.getElementById('quorumProgress');

        // Export and Zoom elements
        this.exportCSVBtn = document.getElementById('exportCSVBtn');
        this.addZoomParticipantsBtn = document.getElementById('addZoomParticipantsBtn');
        this.zoomParticipants = document.getElementById('zoomParticipants');

        // Bulk check-in/check-out elements
        this.bulkCheckInBtn = document.getElementById('bulkCheckInBtn');
        this.bulkCheckInIds = document.getElementById('bulkCheckInIds');
        this.bulkCheckInNames = document.getElementById('bulkCheckInNames');
        this.bulkCheckOutBtn = document.getElementById('bulkCheckOutBtn');
        this.bulkCheckOutIds = document.getElementById('bulkCheckOutIds');
        this.bulkCheckOutNames = document.getElementById('bulkCheckOutNames');
    }

    bindEvents() {
        // CSV Upload
        this.csvUpload.addEventListener('change', (e) => this.handleCSVUpload(e));

        // Camera Modal
        this.cameraScanBtn.addEventListener('click', () => this.openCameraModal());
        this.closeCameraBtn.addEventListener('click', () => this.closeCameraModal());
        this.captureBtn.addEventListener('click', () => this.captureID());

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.cameraModal.classList.contains('hidden')) {
                this.closeCameraModal();
            }
        });

        // Search
        this.studentSearch.addEventListener('input', (e) => this.filterStudents(e.target.value));

        // Manual ID entry
        this.idScanner.addEventListener('input', (e) => this.checkManualEntry(e.target.value));

        // Export CSV
        this.exportCSVBtn.addEventListener('click', () => this.exportCSV());

        // Zoom participants
        this.addZoomParticipantsBtn.addEventListener('click', () => this.addZoomParticipants());

        // Bulk check-in/check-out
        this.bulkCheckInBtn.addEventListener('click', () => this.bulkCheckIn());
        this.bulkCheckOutBtn.addEventListener('click', () => this.bulkCheckOut());

        // Remove student - event delegation
        this.verifiedStudentsDiv.addEventListener('click', (e) => {
            if (e.target.closest('.remove-student')) {
                const studentId = e.target.closest('.remove-student').dataset.studentId;
                this.removeStudent(studentId);
            }
        });
    }

    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target.result;
            this.parseCSV(csvText);
        };
        reader.readAsText(file);
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Validate headers
        const requiredHeaders = [
            'Student Number',
            'Primary Last Name',
            'Primary First Name',
            'Primary Middle Name',
            'Preferred First Name',
            'Email Address',
            'Mailing Address',
            'Phone Number'
        ];

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            showNotification(`Missing required CSV headers: ${missingHeaders.join(', ')}`, 'error');
            return;
        }

        this.students = lines.slice(1).map(line => {
            const values = line.split(',');
            const student = {};
            headers.forEach((header, index) => {
                student[header] = values[index]?.trim() || '';
            });
            student.verified = false;
            student.id = student['Student Number'];
            student.displayName = `${student['Preferred First Name'] || student['Primary First Name']} ${student['Primary Last Name']}`;
            return student;
        });

        showNotification(`Loaded ${this.students.length} students from CSV`, 'success');
        this.renderStudentList();
    }

    renderStudentList() {
        this.searchResults.innerHTML = '';
        if (this.students.length === 0) return;

        this.students.forEach(student => {
            const div = document.createElement('div');
            div.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer';
            div.textContent = `${student.displayName} (${student.id})`;
            div.addEventListener('click', () => this.verifyStudent(student));
            this.searchResults.appendChild(div);
        });
    }

    filterStudents(query) {
        const results = this.students.filter(student =>
            student.displayName.toLowerCase().includes(query.toLowerCase()) ||
            student.id.includes(query)
        );

        this.searchResults.innerHTML = '';
        if (results.length === 0 && query.length > 0) {
            this.searchResults.innerHTML = '<div class="px-4 py-2 text-gray-500">No students found</div>';
        } else {
            results.forEach(student => {
                const div = document.createElement('div');
                div.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer';
                div.textContent = `${student.displayName} (${student.id})`;
                div.addEventListener('click', () => this.verifyStudent(student));
                this.searchResults.appendChild(div);
            });
        }

        this.searchResults.classList.toggle('hidden', results.length === 0);
    }

    verifyStudent(student) {
        if (this.verifiedStudents.has(student.id)) {
            showNotification('Student already verified', 'warning');
            return;
        }

        this.verifiedStudents.add(student.id);
        student.verified = true;

        this.updateVerifiedStudents();
        this.updateQuorum();

        showNotification(`Verified: ${student.displayName}`, 'success');

        // Clear search
        this.studentSearch.value = '';
        this.searchResults.classList.add('hidden');
        this.idScanner.value = '';
    }

    checkManualEntry(value) {
        if (value.length < 7) return;

        const student = this.students.find(s =>
            s.id === value ||
            s.id.endsWith(value) ||
            value === s.id
        );

        if (student) {
            this.verifyStudent(student);
        } else {
            showNotification('Student ID not found in database', 'error');
        }
    }

    updateVerifiedStudents() {
        this.verifiedStudentsDiv.innerHTML = '';

        Array.from(this.verifiedStudents).forEach(studentId => {
            const student = this.students.find(s => s.id === studentId);
            if (student) {
                const card = document.createElement('div');
                card.className = 'student-card bg-green-50 border border-green-200 rounded-lg p-4';
                card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i data-feather="user" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-800">${student.displayName}</h3>
                                <p class="text-sm text-gray-600">ID: ${student.id}</p>
                            </div>
                        </div>
                        <div class="text-green-600 flex items-center gap-2">
                            <i data-feather="check-circle" class="w-6 h-6"></i>
                            <button class="remove-student text-red-500 hover:text-red-700" data-student-id="${student.id}">
                                <i data-feather="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                `;
                this.verifiedStudentsDiv.appendChild(card);
                feather.replace();
            }
        });

        if (this.verifiedStudents.size === 0) {
            this.verifiedStudentsDiv.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i data-feather="users" class="w-12 h-12 mx-auto text-gray-300"></i>
                    <p>No students verified yet</p>
                </div>
            `;
            feather.replace();
        }
    }

    updateQuorum() {
        const count = this.verifiedStudents.size;
        this.quorumCount.textContent = count;
        const percentage = Math.min((count / this.quorumRequirement) * 100, 100);
        this.quorumProgress.style.width = `${percentage}%`;
    }

    async openCameraModal() {
        this.cameraModal.classList.remove('hidden');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.cameraFeed.srcObject = stream;
            this.cameraFeed.play();
        } catch (error) {
            showNotification('Failed to access camera', 'error');
            this.closeCameraModal();
        }
    }

    closeCameraModal() {
        this.cameraModal.classList.add('hidden');

        if (this.cameraFeed.srcObject) {
            const tracks = this.cameraFeed.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.cameraFeed.srcObject = null;
        }
    }

    captureID() {
        const canvas = this.cameraCanvas;
        canvas.width = this.cameraFeed.videoWidth;
        canvas.height = this.cameraFeed.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.cameraFeed, 0, 0, canvas.width, canvas.height);

        // Process the captured image (simulate OCR)
        this.processCapturedImage(canvas);
    }

    processCapturedImage(canvas) {
        // For demonstration, we'll simulate finding a student ID
        // In a real implementation, you'd use an OCR library to extract text

        // Mock - assume the capture is successful and find a random unverified student
        const unverifiedStudents = this.students.filter(s => !this.verifiedStudents.has(s.id));
        if (unverifiedStudents.length > 0) {
            const randomStudent = unverifiedStudents[Math.floor(Math.random() * unverifiedStudents.length)];
            this.verifyStudent(randomStudent);
            showNotification('ID scanned successfully', 'success');
        } else {
            showNotification('All students are already verified or ID not recognized', 'warning');
        }

        this.closeCameraModal();
    }

    exportCSV() {
        if (this.verifiedStudents.size === 0) {
            showNotification('No students to export', 'warning');
            return;
        }

        const headers = ['Student Number', 'Preferred First Name', 'Primary Last Name', 'Email Address', 'Verified At'];
        const csvContent = [
            headers.join(','),
            ...Array.from(this.verifiedStudents).map(studentId => {
                const student = this.students.find(s => s.id === studentId);
                if (student) {
                    return [
                        student['Student Number'] || '',
                        student['Preferred First Name'] || student['Primary First Name'] || '',
                        student['Primary Last Name'] || '',
                        student['Email Address'] || '',
                        new Date().toLocaleString()
                    ].join(',');
                }
            }).filter(Boolean)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showNotification('Attendance CSV exported successfully', 'success');
    }

    addZoomParticipants() {
        const text = this.zoomParticipants.value.trim();
        if (!text) {
            showNotification('Please enter participant names or IDs', 'warning');
            return;
        }

        let added = 0;

        if (text.includes(',')) {
            // Handle comma-separated IDs
            const ids = text.split(',').map(id => id.trim()).filter(id => id);
            ids.forEach(id => {
                const student = this.students.find(s => s.id === id);
                if (student && !this.verifiedStudents.has(student.id)) {
                    this.verifyStudent(student);
                    added++;
                }
            });
        } else {
            // Handle names (one per line)
            const names = text.split('\n').map(name => name.trim()).filter(name => name);
            names.forEach(name => {
                // Try to find by name match (case insensitive)
                const student = this.students.find(s =>
                    s.displayName.toLowerCase() === name.toLowerCase() ||
                    s.displayName.toLowerCase().includes(name.toLowerCase()) ||
                    (s['Preferred First Name'] + ' ' + s['Primary Last Name']).toLowerCase() === name.toLowerCase()
                );

                if (student && !this.verifiedStudents.has(student.id)) {
                    this.verifyStudent(student);
                    added++;
                }
            });
        }

        if (added > 0) {
            showNotification(`Added ${added} Zoom participants to attendance`, 'success');
            this.zoomParticipants.value = '';
        } else {
            showNotification('No new participants found to add', 'warning');
        }
    }

    bulkCheckIn() {
        const idsText = this.bulkCheckInIds.value.trim();
        const namesText = this.bulkCheckInNames.value.trim();

        if (!idsText && !namesText) {
            showNotification('Please enter student IDs or names to check in', 'warning');
            return;
        }

        let checkedIn = 0;

        // Process comma-separated IDs
        if (idsText) {
            const ids = idsText.split(',').map(id => id.trim()).filter(id => id);
            ids.forEach(id => {
                const student = this.students.find(s => s.id === id);
                if (student && !this.verifiedStudents.has(student.id)) {
                    this.verifyStudent(student);
                    checkedIn++;
                }
            });
        }

        // Process comma-separated names
        if (namesText) {
            const names = namesText.split(',').map(name => name.trim()).filter(name => name);
            names.forEach(name => {
                const student = this.students.find(s =>
                    s.displayName.toLowerCase() === name.toLowerCase() ||
                    s.displayName.toLowerCase().includes(name.toLowerCase()) ||
                    (s['Preferred First Name'] + ' ' + s['Primary Last Name']).toLowerCase() === name.toLowerCase()
                );
                if (student && !this.verifiedStudents.has(student.id)) {
                    this.verifyStudent(student);
                    checkedIn++;
                }
            });
        }

        if (checkedIn > 0) {
            showNotification(`Bulk check-in completed: ${checkedIn} students added`, 'success');
            this.bulkCheckInIds.value = '';
            this.bulkCheckInNames.value = '';
        } else {
            showNotification('No new students found to check in', 'warning');
        }
    }

    bulkCheckOut() {
        const idsText = this.bulkCheckOutIds.value.trim();
        const namesText = this.bulkCheckOutNames.value.trim();

        if (!idsText && !namesText) {
            showNotification('Please enter student IDs or names to check out', 'warning');
            return;
        }

        let checkedOut = 0;

        // Process comma-separated IDs
        if (idsText) {
            const ids = idsText.split(',').map(id => id.trim()).filter(id => id);
            ids.forEach(id => {
                const student = this.students.find(s => s.id === id);
                if (student && this.verifiedStudents.has(student.id)) {
                    this.removeStudent(student.id);
                    checkedOut++;
                }
            });
        }

        // Process comma-separated names
        if (namesText) {
            const names = namesText.split(',').map(name => name.trim()).filter(name => name);
            names.forEach(name => {
                const student = this.students.find(s =>
                    s.displayName.toLowerCase() === name.toLowerCase() ||
                    s.displayName.toLowerCase().includes(name.toLowerCase()) ||
                    (s['Preferred First Name'] + ' ' + s['Primary Last Name']).toLowerCase() === name.toLowerCase()
                );
                if (student && this.verifiedStudents.has(student.id)) {
                    this.removeStudent(student.id);
                    checkedOut++;
                }
            });
        }

        if (checkedOut > 0) {
            showNotification(`Bulk check-out completed: ${checkedOut} students removed`, 'success');
            this.bulkCheckOutIds.value = '';
            this.bulkCheckOutNames.value = '';
        } else {
            showNotification('No students found to check out', 'warning');
        }
    }

    removeStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            this.verifiedStudents.delete(studentId);
            student.verified = false;
            this.updateVerifiedStudents();
            this.updateQuorum();
            showNotification(`Removed: ${student.displayName}`, 'info');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentVerifier();
});
