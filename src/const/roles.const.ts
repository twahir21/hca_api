export type Roles = 
    | 'super-admin' 
    | 'school-admin' // second master
    | 'principal' // head master 
    | 'bursar' 
    | 'dorm-master' // highest rank for dormitories he-she creates patrons and matrons
    | 'transport-officer' 
    | 'driver' 
    | 'store-keeper' // also gives report of buldings e.g. vitu vya chooni (anakagua), school chairs and all hardwares and supplies
    | 'class-teacher' 
    | 'academic-master'
    | 'displinary-officer' 
    | 'HOD' // also deals with clubs management
    | 'ict-officer' // also deals with bulk sms management and security
    | 'librarian' 
    | 'meal-officer' // deals with meals and chefs and food stock
    | 'nurse' 
    | 'parent' // also deals with submitting student assignments
    | 'registrar' 
    | 'teacher' 
    | 'sports-master'
    | 'lab-technician' 
    | 'cleaning-officer' 
    | 'election-officer' 
    | 'debate-manager'
    | 'trips-officer' 
    | 'maintainance-officer' // deals with furniture repairs/ toilets / tables etc
    | 'matron' 
    | 'patron' // dormitories closest care esp girls dorm and displine in dorms
    | 'counselor'

    // 26 TOTAL ROLES
export const allowedRoles = new Set<Roles>([
    'super-admin',              // System owner, SaaS level
    'school-admin',             // Second Master, operational management
    'principal',                // Head Master, instructional leadership
    'bursar',                   // High-level finance
    'dorm-master',              // Highest rank for dormitories
    'transport-officer',
    'driver',
    'store-keeper',             // Manages hardwares, supplies, and building checks
    'class-teacher',
    'academic-master',
    'displinary-officer',
    'HOD',                      // Head of Department, deals with clubs management
    'ict-officer',              // Deals with bulk SMS and security
    'librarian',
    'meal-officer',             // Deals with meals, chefs, and food stock
    'nurse',
    'parent',                   // Also deals with submitting student assignments
    'registrar',
    'teacher',
    'sports-master',
    'lab-technician',
    'cleaning-officer',
    'election-officer',
    'debate-manager',
    'trips-officer',
    'maintainance-officer',     // Deals with furniture repairs/toilets/tables etc
    'matron',                   // Dormitories closest care (female dorms/discipline)
    'patron',                   // Dormitories closest care (male dorms/discipline)
    'counselor',
])