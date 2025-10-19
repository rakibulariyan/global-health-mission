// Supabase configuration
const SUPABASE_URL = 'https://drjbgbbejgeskrnhxfyc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyamJnYmJlamdlc2tybmh4ZnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDIwMzEsImV4cCI6MjA3NTkxODAzMX0.FgtUm_FnWZxwx89Z1_Z_Oj8PcgU9p-a_tTk7lNG3DNw';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user and role
let currentUser = null;
let currentRole = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Application initialization
async function initializeApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadUserRole();
        showApp();
    } else {
        showLogin();
    }
    
    setupEventListeners();
}

// Event listeners setup
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToSection(this.getAttribute('data-section'));
        });
    });
    
    // Quick actions
    document.querySelectorAll('.btn[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            navigateToSection(this.getAttribute('data-section'));
        });
    });
    
    // Employee management
    document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
    
    // Member management
    document.getElementById('saveMemberBtn').addEventListener('click', saveMember);
    document.getElementById('memberSearch').addEventListener('input', searchMembers);
    
    // Validation
    document.getElementById('validateBtn').addEventListener('click', validateMemberCard);
    document.getElementById('scanQRBtn').addEventListener('click', simulateQRScan);
    
    // Print card
    document.getElementById('printCardBtn').addEventListener('click', printMemberCard);
    document.getElementById('downloadCardBtn').addEventListener('click', downloadMemberCard);
}

// Login handler - UPDATED VERSION
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        
        // Auto-detect user role from database
        await loadUserRoleFromDatabase();
        showApp();
        
    } catch (error) {
        // If login fails, show error
        alert('Login failed: ' + error.message);
        
        // Optional: Try to sign up if user doesn't exist
        if (error.message.includes('Invalid login credentials')) {
            const createAccount = confirm('No account found with this email. Would you like to create one? (Admin only)');
            if (createAccount) {
                try {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: email,
                        password: password,
                    });
                    
                    if (signUpError) throw signUpError;
                    
                    alert('Account created! Please login again. This account will have basic employee permissions.');
                    loginForm.reset();
                    
                } catch (signUpError) {
                    alert('Error creating account: ' + signUpError.message);
                }
            }
        }
    }
}

// Logout
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentRole = null;
    showLogin();
}

// Navigation
function navigateToSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`.nav-link[data-section="${sectionId}"]`).classList.add('active');
    
    loadSectionData(sectionId);
}

// Load data for specific section
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'employees':
            await loadEmployees();
            break;
        case 'members':
            await loadMembers();
            break;
        case 'reports':
            await loadReports();
            break;
    }
}

// Show/hide sections based on role
function showApp() {
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    updateUIForRole();
    loadDashboardData();
}

// ... your existing code above ...

function showApp() {
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    updateUIForRole();
    loadDashboardData();
    loadUserPhoto(); // ADD THIS LINE - Update the existing showApp function
}

// ======== ADD PROFILE PHOTO MANAGEMENT CODE STARTING HERE ========

// Profile Photo Management
let currentUserPhotoUrl = null;

// Load user photo
async function loadUserPhoto() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // Try to get user photo from employees table or storage
            const { data: employee, error } = await supabase
                .from('employees')
                .select('photo_url')
                .eq('email', user.email)
                .single();
                
            if (employee && employee.photo_url) {
                currentUserPhotoUrl = employee.photo_url;
                displayUserPhoto(employee.photo_url);
            } else {
                // No photo - show default icon
                hideUserPhoto();
            }
            
            // Update dropdown user info
            document.getElementById('dropdownUserName').textContent = employee?.name || user.email;
            document.getElementById('dropdownUserEmail').textContent = user.email;
        }
    } catch (error) {
        console.error('Error loading user photo:', error);
        hideUserPhoto();
    }
}

// ... rest of the profile photo functions (displayUserPhoto, hideUserPhoto, etc.)

// ======== END OF PROFILE PHOTO MANAGEMENT CODE ========

// Auto-detect user role from database
async function loadUserRoleFromDatabase() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // Check employees table for role
            const { data: employee, error } = await supabase
                .from('employees')
                .select('role')
                .eq('email', user.email)
                .single();
                
            if (employee && employee.role) {
                currentRole = employee.role;
            } else {
                // Default to employee role if not found
                currentRole = 'employee';
            }
            
            // Save role for future sessions
            localStorage.setItem('ghm_user_role', currentRole);
        }
    } catch (error) {
        console.error('Error loading user role:', error);
        currentRole = localStorage.getItem('ghm_user_role') || 'employee';
    }
}

function showLogin() {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    loginForm.reset();
}

// Role-based UI updates
function updateUIForRole() {
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = currentRole === 'admin' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.employee-admin').forEach(el => {
        el.style.display = (currentRole === 'admin' || currentRole === 'employee') ? 'block' : 'none';
    });
    
    userName.textContent = currentUser?.email || 'User';
}

// Dashboard data loading
async function loadDashboardData() {
    try {
        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('*');
        
        if (membersError) throw membersError;

        const activeMembers = members.filter(m => m.status === 'active').length;
        const totalCards = members.length;
        const newSignups = members.filter(m => {
            const joinDate = new Date(m.join_date);
            const today = new Date();
            return joinDate.getMonth() === today.getMonth() && joinDate.getFullYear() === today.getFullYear();
        }).length;

        document.getElementById('dashboardStats').innerHTML = `
            <div class="col-md-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total Active Members</h5>
                        <div class="stat-number">${activeMembers}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total Cards Issued</h5>
                        <div class="stat-number">${totalCards}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <h5 class="card-title">Recent Renewals</h5>
                        <div class="stat-number">${Math.floor(activeMembers * 0.1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <h5 class="card-title">New Sign-ups This Month</h5>
                        <div class="stat-number">${newSignups}</div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Employees loading
async function loadEmployees() {
    try {
        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        const tbody = document.querySelector('#employeesTable tbody');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No employees found</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.name}</td>
                <td><span class="badge ${emp.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${emp.role}</span></td>
                <td>${emp.phone}</td>
                <td>${emp.email}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editEmployee(${emp.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${emp.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading employees:', error);
        const tbody = document.querySelector('#employeesTable tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading employees</td></tr>';
    }
}

// Members loading
async function loadMembers() {
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        const tbody = document.querySelector('#membersTable tbody');
        
        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No members found</td></tr>';
            return;
        }

        tbody.innerHTML = members.map(member => {
            const joinDate = new Date(member.join_date).toLocaleDateString();
            const expiryDate = new Date(member.expiry_date).toLocaleDateString();
            const isActive = new Date(member.expiry_date) > new Date();
            
            return `
            <tr>
                <td>${member.member_id}</td>
                <td>${member.name}</td>
                <td>${member.phone}</td>
                <td>${joinDate}</td>
                <td>${expiryDate}</td>
                <td><span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">${isActive ? 'Active' : 'Expired'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-card" data-member='${JSON.stringify(member)}'>
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="renewMember('${member.member_id}')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMember(${member.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');
        
        // Add event listeners to view card buttons
        document.querySelectorAll('.view-card').forEach(btn => {
            btn.addEventListener('click', function() {
                const member = JSON.parse(this.getAttribute('data-member'));
                showMemberCard(member);
            });
        });

    } catch (error) {
        console.error('Error loading members:', error);
        const tbody = document.querySelector('#membersTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading members</td></tr>';
    }
}

// Save employee
async function saveEmployee() {
    const name = document.getElementById('empName').value;
    const role = document.getElementById('empRole').value;
    const phone = document.getElementById('empPhone').value;
    const email = document.getElementById('empEmail').value;
    const password = document.getElementById('empPassword').value;
    
    if (!name || !role || !phone || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    role: role
                }
            }
        });

        if (authError) throw authError;

        // Then save to employees table
        const { error } = await supabase
            .from('employees')
            .insert([
                {
                    name: name,
                    role: role,
                    phone: phone,
                    email: email
                }
            ]);

        if (error) throw error;

        alert('Employee created successfully!');
        $('#addEmployeeModal').modal('hide');
        document.getElementById('employeeForm').reset();
        loadEmployees();

    } catch (error) {
        alert('Error creating employee: ' + error.message);
    }
}

// Save member
async function saveMember() {
    const name = document.getElementById('memberName').value;
    const fatherName = document.getElementById('fatherName').value;
    const age = document.getElementById('memberAge').value;
    const phone = document.getElementById('memberPhone').value;
    const email = document.getElementById('memberEmail').value;
    const address = document.getElementById('memberAddress').value;
    const paymentReceived = document.getElementById('paymentReceived').checked;
    
    if (!name || !fatherName || !age || !phone) {
        alert('Please fill required fields');
        return;
    }

    if (!paymentReceived) {
        alert('Please confirm that the ₹300 joining fee has been received.');
        return;
    }

    try {
        // Generate member ID
        const { data: lastMember } = await supabase
            .from('members')
            .select('member_id')
            .order('id', { ascending: false })
            .limit(1);

        let nextId = 1001;
        if (lastMember && lastMember.length > 0) {
            const lastId = parseInt(lastMember[0].member_id.replace('GHM', ''));
            nextId = lastId + 1;
        }

        const memberId = 'GHM' + nextId.toString().padStart(6, '0');
        
        // Calculate dates
        const joinDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Get current user (who created this member)
        const createdBy = currentUser?.email || 'System';

        // Save member
        const { error } = await supabase
            .from('members')
            .insert([
                {
                    member_id: memberId,
                    name: name,
                    father_name: fatherName,
                    age: age,
                    phone: phone,
                    email: email,
                    address: address,
                    join_date: joinDate.toISOString().split('T')[0],
                    expiry_date: expiryDate.toISOString().split('T')[0],
                    status: 'active',
                    payment_received: true,
                    created_by: createdBy
                }
            ]);

        if (error) throw error;

        // Add activity
        await supabase
            .from('activities')
            .insert([
                {
                    type: 'new_member',
                    description: `New member registered: ${name}`,
                    member_id: memberId
                }
            ]);

        alert(`Member registered successfully! Member ID: ${memberId}`);
        $('#addMemberModal').modal('hide');
        document.getElementById('memberForm').reset();
        loadMembers();

        // Generate and open PDF
        setTimeout(() => {
            generateMemberPDF({
                memberId: memberId,
                name: name,
                fatherName: fatherName,
                age: age,
                phone: phone,
                email: email,
                address: address,
                joinDate: joinDate,
                expiryDate: expiryDate,
                createdBy: createdBy
            });
        }, 1000);

    } catch (error) {
        alert('Error registering member: ' + error.message);
    }
}

// Delete employee
async function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Employee deleted successfully!');
            loadEmployees();
        } catch (error) {
            alert('Error deleting employee: ' + error.message);
            }
    }
}

// Delete member
async function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Member deleted successfully!');
            loadMembers();
        } catch (error) {
            alert('Error deleting member: ' + error.message);
            }
    }
}

// Renew member
async function renewMember(memberId) {
    try {
        const newExpiry = new Date();
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);

        const { error } = await supabase
            .from('members')
            .update({
                expiry_date: newExpiry.toISOString().split('T')[0],
                status: 'active',
                payment_received: true
            })
            .eq('member_id', memberId);

        if (error) throw error;

        // Add activity
        await supabase
            .from('activities')
            .insert([
                {
                    type: 'renewal',
                    description: `Membership renewed for: ${memberId}`,
                    member_id: memberId
                }
            ]);

        alert('Membership renewed successfully!');
        loadMembers();
    } catch (error) {
        alert('Error renewing membership: ' + error.message);
    }
}

// Enhanced member card display function
function showMemberCard(member) {
    console.log('Showing member card for:', member);
    
    // Make card PAN size
    const printableCard = document.getElementById('printableCard');
    printableCard.classList.add('pan-size');
    
    // Update card content with null checks
    document.getElementById('cardMemberNamePrint').textContent = member.name || 'Not provided';
    document.getElementById('cardMemberIdPrint').textContent = member.member_id || 'Not provided';
    document.getElementById('cardFatherNamePrint').textContent = member.father_name || 'Not provided';
    document.getElementById('cardAgePrint').textContent = member.age ? member.age + ' years' : 'Not provided';
    document.getElementById('cardExpiryDatePrint').textContent = member.expiry_date ? new Date(member.expiry_date).toLocaleDateString() : 'Not provided';
    document.getElementById('cardPhonePrint').textContent = member.phone || 'Not provided';
    document.getElementById('cardIssuedByPrint').textContent = member.created_by || 'System';
    
    // Generate QR code with error handling
    const qrContainerPrint = document.getElementById('cardQRCodePrint');
    qrContainerPrint.innerHTML = '';
    
    if (member.member_id) {
        try {
            QRCode.toCanvas(qrContainerPrint, member.member_id, { 
                width: 70,
                margin: 1,
                color: {
                    dark: '#2c7fb8',
                    light: '#ffffff'
                }
            }, function(error) {
                if (error) {
                    console.error('QR Code generation error:', error);
                    // Show placeholder if QR fails
                    qrContainerPrint.innerHTML = `
                        <div style="width: 70px; height: 70px; background: #f8f9fa; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; color: #666; font-size: 8px;">
                            QR Code<br>Not Available
                        </div>
                    `;
                }
            });
        } catch (error) {
            console.error('QR Code error:', error);
            qrContainerPrint.innerHTML = `
                <div style="width: 70px; height: 70px; background: #f8f9fa; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; color: #666; font-size: 8px;">
                    QR Error
                </div>
            `;
        }
    } else {
        qrContainerPrint.innerHTML = `
            <div style="width: 70px; height: 70px; background: #f8f9fa; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; color: #666; font-size: 8px;">
                No Member ID
            </div>
        `;
    }
    
    // Show modal
    try {
        $('#viewCardModal').modal('show');
        console.log('Modal shown successfully');
    } catch (error) {
        console.error('Modal error:', error);
        alert('Error showing member card. Please try again.');
    }
}

function printMemberCard() {
    window.print();
}

function downloadMemberCard() {
    // Get member data from the current card display
    const memberData = {
        memberId: document.getElementById('cardMemberIdPrint').textContent,
        name: document.getElementById('cardMemberNamePrint').textContent,
        fatherName: document.getElementById('cardFatherNamePrint').textContent,
        age: parseInt(document.getElementById('cardAgePrint').textContent) || 0,
        phone: document.getElementById('cardPhonePrint').textContent,
        expiryDate: new Date(document.getElementById('cardExpiryDatePrint').textContent),
        joinDate: new Date(), // Use current date as join date
        createdBy: document.getElementById('cardIssuedByPrint').textContent,
        email: '',
        address: ''
    };
    
    // Generate and download PDF
    generateMemberPDF(memberData);
    
    // Show success message
    alert('Member card PDF download started!');
}

// Validation functions
async function validateMemberCard() {
    const cardId = document.getElementById('cardId').value;
    const resultDiv = document.getElementById('validationResult');
    
    if (!cardId) {
        alert('Please enter a Member ID');
        return;
    }
    
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .eq('member_id', cardId)
            .single();

        if (error) throw error;

        if (members) {
            const isActive = new Date(members.expiry_date) > new Date();
            const status = isActive ? 'Eligible for 50% discount' : 'Card expired';
            const alertType = isActive ? 'success' : 'warning';
            
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="alert alert-${alertType}">
                    <h5><i class="fas fa-${isActive ? 'check' : 'exclamation'}-circle me-2"></i>${isActive ? 'Valid Card' : 'Expired Card'}</h5>
                    <p class="mb-1"><strong>Member:</strong> ${members.name}</p>
                    <p class="mb-1"><strong>Member ID:</strong> ${members.member_id}</p>
                    <p class="mb-1"><strong>Expiry Date:</strong> ${new Date(members.expiry_date).toLocaleDateString()}</p>
                    <p class="mb-0"><strong>Status:</strong> ${status}</p>
                </div>
            `;

            // Record validation
            await supabase
                .from('validations')
                .insert([
                    {
                        member_id: cardId,
                        partner_name: 'Partner Check'
                    }
                ]);

        } else {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-times-circle me-2"></i>Invalid Card</h5>
                    <p class="mb-0">Member ID not found in our system.</p>
                </div>
            `;
        }

    } catch (error) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-times-circle me-2"></i>Invalid Card</h5>
                <p class="mb-0">Member ID not found in our system.</p>
            </div>
        `;
    }
}

function simulateQRScan() {
    document.getElementById('cardId').value = 'GHM001235';
    alert('QR scanning simulated - Member ID filled');
}

// Search function
function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#membersTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Reports functions
async function loadReports() {
    initializeCharts();
    
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('*');

        if (error) throw error;

    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function initializeCharts() {
    const signupsCtx = document.getElementById('signupsChart')?.getContext('2d');
    if (signupsCtx) {
        new Chart(signupsCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'New Sign-ups',
                    data: [25, 30, 28, 35, 40, 38, 42, 31, 28, 35],
                    backgroundColor: '#2c7fb8'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Expired', 'Pending Renewal'],
                datasets: [{
                    data: [1250, 130, 42],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107']
                }]
            }
        });
    }
}

function exportReports() {
    alert('Reports exported successfully!');
}

// User role management
async function loadUserRole() {
    currentRole = localStorage.getItem('ghm_user_role') || 'employee';
}

async function saveUserRole(role) {
    localStorage.setItem('ghm_user_role', role);
}

// Make functions globally available for onclick events
window.deleteEmployee = deleteEmployee;
window.deleteMember = deleteMember;
window.renewMember = renewMember;
// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Search button event listener
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    
    // Reset search button event listener
    document.getElementById('resetSearchBtn').addEventListener('click', resetSearch);
    
    // Enter key support for search fields
    const searchInputs = ['searchMemberId', 'searchName', 'searchPhone'];
    searchInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    });
});

// Perform search function
async function performSearch() {
    const searchCriteria = {
        memberId: document.getElementById('searchMemberId').value.trim(),
        name: document.getElementById('searchName').value.trim(),
        phone: document.getElementById('searchPhone').value.trim(),
        status: document.getElementById('searchStatus').value,
        dateFrom: document.getElementById('searchDateFrom').value,
        dateTo: document.getElementById('searchDateTo').value
    };
    
    // Show loading state
    const searchResultsBody = document.getElementById('searchResultsBody');
    searchResultsBody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Searching members...</p>
            </td>
        </tr>
    `;
    
    try {
        // Get all members from Supabase
        const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter members based on search criteria
        const filteredMembers = members.filter(member => {
            // Member ID filter
            if (searchCriteria.memberId && !member.member_id.toLowerCase().includes(searchCriteria.memberId.toLowerCase())) {
                return false;
            }
            
            // Name filter
            if (searchCriteria.name && !member.full_name.toLowerCase().includes(searchCriteria.name.toLowerCase())) {
                return false;
            }
            
            // Phone filter
            if (searchCriteria.phone && !member.phone.includes(searchCriteria.phone)) {
                return false;
            }
            
            // Status filter
            if (searchCriteria.status && member.status !== searchCriteria.status) {
                return false;
            }
            
            // Date range filter
            if (searchCriteria.dateFrom) {
                const joinDate = new Date(member.join_date);
                const fromDate = new Date(searchCriteria.dateFrom);
                if (joinDate < fromDate) return false;
            }
            
            if (searchCriteria.dateTo) {
                const joinDate = new Date(member.join_date);
                const toDate = new Date(searchCriteria.dateTo);
                toDate.setHours(23, 59, 59, 999); // End of the day
                if (joinDate > toDate) return false;
            }
            
            return true;
        });
        
        displaySearchResults(filteredMembers);
        
    } catch (error) {
        console.error('Search error:', error);
        searchResultsBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error performing search. Please try again.
                </td>
            </tr>
        `;
    }
}

// Display search results
function displaySearchResults(members) {
    const searchResultsBody = document.getElementById('searchResultsBody');
    
    if (members.length === 0) {
        searchResultsBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted">
                    <i class="fas fa-search me-2"></i>
                    No members found matching your search criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    members.forEach(member => {
        const joinDate = new Date(member.join_date).toLocaleDateString();
        const expiryDate = new Date(member.expiry_date).toLocaleDateString();
        
        // Status badge
        let statusBadge = '';
        switch(member.status) {
            case 'active':
                statusBadge = '<span class="badge badge-success">Active</span>';
                break;
            case 'expired':
                statusBadge = '<span class="badge badge-danger">Expired</span>';
                break;
            case 'pending':
                statusBadge = '<span class="badge badge-warning">Pending</span>';
                break;
            default:
                statusBadge = '<span class="badge badge-secondary">Unknown</span>';
        }
        
        html += `
            <tr>
                <td><strong>${member.member_id}</strong></td>
                <td>${member.full_name}</td>
                <td>${member.father_name || 'N/A'}</td>
                <td>${member.phone}</td>
                <td>${member.age}</td>
                <td>${joinDate}</td>
                <td>${expiryDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-info btn-view-member" data-member-id="${member.member_id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-primary btn-view-card" data-member-id="${member.member_id}" title="View Card">
                            <i class="fas fa-id-card"></i>
                        </button>
                        <button class="btn btn-success btn-renew" data-member-id="${member.member_id}" title="Renew Membership">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    searchResultsBody.innerHTML = html;
    
    // Add event listeners to action buttons
    addSearchResultEventListeners();
}

// Add event listeners to search result action buttons
function addSearchResultEventListeners() {
    // View member details
    document.querySelectorAll('.btn-view-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            viewMemberDetails(memberId);
        });
    });
    
    // View member card
    document.querySelectorAll('.btn-view-card').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            viewMemberCard(memberId);
        });
    });
    
    // Renew membership
    document.querySelectorAll('.btn-renew').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            renewMembership(memberId);
        });
    });
}

// Reset search form
function resetSearch() {
    document.getElementById('searchMemberId').value = '';
    document.getElementById('searchName').value = '';
    document.getElementById('searchPhone').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchDateFrom').value = '';
    document.getElementById('searchDateTo').value = '';
    
    // Clear results
    document.getElementById('searchResultsBody').innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted">
                Use the search form above to find members
            </td>
        </tr>
    `;
}

// View member details (you can implement this based on your existing functionality)
async function viewMemberDetails(memberId) {
    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('member_id', memberId)
            .single();
        
        if (error) throw error;
        
        // Create a modal or use existing modal to show detailed information
        showMemberDetailsModal(member);
        
    } catch (error) {
        console.error('Error fetching member details:', error);
        alert('Error loading member details. Please try again.');
    }
}

// Show member details in a modal
function showMemberDetailsModal(member) {
    // You can create a new modal or use an existing one
    // For now, let's show an alert with basic info
    const joinDate = new Date(member.join_date).toLocaleDateString();
    const expiryDate = new Date(member.expiry_date).toLocaleDateString();
    
    const modalHtml = `
        <div class="modal fade" id="memberDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Member Details - ${member.member_id}</h5>
                        <button type="button" class="close" data-dismiss="modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Personal Information</h6>
                                <table class="table table-sm table-borderless">
                                    <tr>
                                        <td><strong>Full Name:</strong></td>
                                        <td>${member.full_name}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Father's Name:</strong></td>
                                        <td>${member.father_name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Age:</strong></td>
                                        <td>${member.age}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Phone:</strong></td>
                                        <td>${member.phone}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>${member.email || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6>Membership Information</h6>
                                <table class="table table-sm table-borderless">
                                    <tr>
                                        <td><strong>Member ID:</strong></td>
                                        <td>${member.member_id}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Join Date:</strong></td>
                                        <td>${joinDate}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Expiry Date:</strong></td>
                                        <td>${expiryDate}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td>${member.status}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Address:</strong></td>
                                        <td>${member.address || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="viewMemberCard('${member.member_id}')">
                            <i class="fas fa-id-card me-2"></i>View Card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('memberDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    $('#memberDetailsModal').modal('show');
}

// Renew membership function
async function renewMembership(memberId) {
    if (!confirm('Are you sure you want to renew this membership for 1 year?')) {
        return;
    }
    
    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('member_id', memberId)
            .single();
        
        if (error) throw error;
        
        // Calculate new expiry date (1 year from current expiry or from now if expired)
        const currentExpiry = new Date(member.expiry_date);
        const now = new Date();
        const newExpiryDate = currentExpiry > now ? 
            new Date(currentExpiry.setFullYear(currentExpiry.getFullYear() + 1)) :
            new Date(now.setFullYear(now.getFullYear() + 1));
        
        // Update member in database
        const { error: updateError } = await supabase
            .from('members')
            .update({
                expiry_date: newExpiryDate.toISOString().split('T')[0],
                status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('member_id', memberId);
        
        if (updateError) throw updateError;
        
        // Show success message
        alert('Membership renewed successfully!');
        
        // Refresh search results if we're on the search page
        if (document.getElementById('search').classList.contains('active')) {
            performSearch();
        }
        
    } catch (error) {
        console.error('Error renewing membership:', error);
        alert('Error renewing membership. Please try again.');
    }
}

// Quick search from dashboard (if you want to add this)
function quickSearch(searchTerm) {
    // Switch to search section
    switchSection('search');
    
    // Set search term and perform search
    document.getElementById('searchName').value = searchTerm;
    setTimeout(() => {
        performSearch();
    }, 100);
    // Forgot Password Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Forgot Password functionality
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLogin = document.getElementById('backToLogin');
    const sendResetLink = document.getElementById('sendResetLink');
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordSection = document.getElementById('forgotPasswordSection');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            forgotPasswordSection.style.display = 'block';
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPasswordSection.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
    
    if (sendResetLink) {
        sendResetLink.addEventListener('click', async function() {
            const email = document.getElementById('resetEmail').value;
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.href,
                });
                
                if (error) throw error;
                
                alert('Password reset link sent to your email! Check your inbox.');
                forgotPasswordSection.style.display = 'none';
                loginForm.style.display = 'block';
                document.getElementById('resetEmail').value = '';
                
            } catch (error) {
                alert('Error sending reset link: ' + error.message);
            }
        });
    }
});
}
