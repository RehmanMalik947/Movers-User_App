// Mock Data and Service for the Logistics App

// --- MOCK DATABASE ---

const USERS = [
    { id: 'u1', name: 'Ali Khan', role: 'user', phone: '03001234567', email: 'user@test.com', password: 'password' },
    { id: 'o1', name: 'Truck King', role: 'owner', phone: '03007654321', email: 'owner@test.com', password: 'password' },
    { id: 'd1', name: 'Driver Dan', role: 'driver', phone: '03001112223', email: 'driver@test.com', password: 'password', ownerId: 'o1', vehicle: 'Hyundai Shehzore' },
];

let JOBS = [
    {
        id: 'j1',
        userId: 'u1',
        title: 'Move Furniture from Gulberg to DHA',
        pickup: 'Gulberg III, Lahore',
        dropoff: 'DHA Phase 5, Lahore',
        goodsType: 'Furniture',
        vehicleType: 'Shehzore',
        date: '2025-01-15T10:00:00Z',
        status: 'CREATED', // CREATED, BIDDING, ACCEPTED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
        bids: [],
    },
    {
        id: 'j2',
        userId: 'u1',
        title: 'Office Shifting',
        pickup: 'Model Town, Lahore',
        dropoff: 'Johar Town, Lahore',
        goodsType: 'Electronics',
        vehicleType: 'Mazda',
        date: '2025-01-20T09:00:00Z',
        status: 'BIDDING',
        bids: [
            { id: 'b1', jobId: 'j2', ownerId: 'o1', amount: 5000, status: 'PENDING' }
        ],
    },
];

// --- HELPERS ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API SERVICE ---

export const mockApi = {
    // AUTH
    login: async (email, password) => {
        console.log('API: Login', email, password);
        await delay(1000);
        const user = USERS.find((u) => u.email === email && u.password === password);
        if (!user) throw new Error('Invalid credentials');
        console.log('API: Login successful', user);
        return user;
    },

    signup: async (name, email, phone, password, role) => {
        await delay(1000);
        const newUser = { id: `u${USERS.length + 1}`, name, email, phone, password, role };
        USERS.push(newUser);
        return newUser;
    },

    // JOBS (User)
    postJob: async (jobData) => {
        await delay(1000);
        const newJob = {
            id: `j${JOBS.length + 1}`,
            status: 'CREATED',
            bids: [],
            ...jobData,
        };
        JOBS.unshift(newJob);
        return newJob;
    },

    getUserJobs: async (userId) => {
        await delay(800);
        return JOBS.filter((j) => j.userId === userId);
    },

    // JOBS (Owner)
    getAvailableJobs: async () => {
        await delay(800);
        return JOBS.filter((j) => j.status === 'CREATED' || j.status === 'BIDDING');
    },

    placeBid: async (jobId, ownerId, amount) => {
        await delay(1000);
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) throw new Error('Job not found');

        const bid = { id: `b${Date.now()}`, jobId, ownerId, amount, status: 'PENDING' };
        job.bids.push(bid);
        if (job.status === 'CREATED') job.status = 'BIDDING';

        return bid;
    },

    // JOBS (Shared)
    acceptBid: async (jobId, bidId) => {
        await delay(1000);
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) throw new Error('Job not found');

        const bid = job.bids.find((b) => b.id === bidId);
        if (!bid) throw new Error('Bid not found');

        bid.status = 'ACCEPTED';
        job.status = 'ACCEPTED';
        job.selectedBidId = bidId;
        job.ownerId = bid.ownerId; // Assign owner to job

        // Reject other bids
        job.bids.forEach(b => {
            if (b.id !== bidId) b.status = 'REJECTED';
        });

        return job;
    },

    // OWNER ASSIGNNMENT
    assignDriver: async (jobId, driverId) => {
        await delay(1000);
        const job = JOBS.find(j => j.id === jobId);
        if (!job) throw new Error("Job not found");

        job.driverId = driverId;
        job.status = 'ASSIGNED';
        return job;
    },

    getMyDrivers: async (ownerId) => {
        await delay(500);
        return USERS.filter(u => u.role === 'driver' && u.ownerId === ownerId);
    },

    getOwnerJobs: async (ownerId) => {
        await delay(800);
        return JOBS.filter(j => j.ownerId === ownerId || j.bids.some(b => b.ownerId === ownerId && b.status === "ACCEPTED"));
    },

    // DRIVER
    getJob: async (jobId) => {
        await delay(500);
        return JOBS.find(j => j.id === jobId);
    },

    getDriverJobs: async (driverId) => {
        await delay(800);
        return JOBS.filter((j) => j.driverId === driverId);
    },

    updateJobStatus: async (jobId, status) => {
        await delay(1000);
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) throw new Error('Job not found');

        job.status = status;
        return job;
    },
};
