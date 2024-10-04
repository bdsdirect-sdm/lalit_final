import express from 'express';
import mysql, { QueryError, ResultSetHeader, RowDataPacket } from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('./uploads', express.static(path.join(__dirname, 'uploads')));

// Database 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password123#@!',
    database: 'user_management',
});

db.connect((err: QueryError | null) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// Multer 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post('/api/users', upload.fields([{ name: 'profilePhoto' }, { name: 'appointmentLetter' }]), async (req: any, res: any) => {
    console.log("files recieved : ", req.files);
    const { firstName, lastName, email, companyAddress, companyCity, companyState, companyZip, homeAddress, homeCity, homeState, homeZip } = req.body;

    if (!firstName || !lastName || !email || !companyAddress || !companyCity || !companyState || !companyZip || !homeAddress || !homeCity || !homeState || !homeZip) {
        return res.status(400).json({ error: 'All fields are mandatory.' });
    }

    const profilePhotoPath = req.files['profilePhoto'] ? req.files['profilePhoto'][0].path : null;
    const appointmentLetterPath = req.files['appointmentLetter'] ? req.files['appointmentLetter'][0].path : null;

    const query = 'INSERT INTO users (firstName, lastName, email, profilePhoto, appointmentLetter) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [firstName, lastName, email, profilePhotoPath, appointmentLetterPath], (err: QueryError | null, results: ResultSetHeader) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data' });
        }

        const userId = results.insertId;

        const addressQuery = 'INSERT INTO addresses (userId, companyAddress, companyCity, companyState, companyZip, homeAddress, homeCity, homeState, homeZip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

        db.query(addressQuery, [userId, companyAddress, companyCity, companyState, companyZip, homeAddress, homeCity, homeState, homeZip], (err) => {
            if (err) {
                console.error('Error inserting address data:', err);
                return res.status(500).json({ error: 'Error inserting address data' });
            }
            res.status(200).json({ message: 'User registered successfully!', userId: userId });
        });
    });
});

app.put('/api/users/:id', upload.fields([{ name: 'profilePhoto' }, { name: 'appointmentLetter' }]), async (req: any, res: any) => {
    const userId = req.params.id;
    const { firstName, lastName, email, companyAddress, companyCity, companyState, companyZip, homeAddress, homeCity, homeState, homeZip } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'First Name, Last Name, and Email are mandatory.' });
    }

    const profilePhotoPath = req.files['profilePhoto'] ? req.files['profilePhoto'][0].path : null;
    const appointmentLetterPath = req.files['appointmentLetter'] ? req.files['appointmentLetter'][0].path : null;

    const query = `
        UPDATE users 
        SET firstName = ?, lastName = ?, email = ?${profilePhotoPath ? ', profilePhoto = ?' : ''}${appointmentLetterPath ? ', appointmentLetter = ?' : ''}
        WHERE id = ?
    `;

    const params: any[] = [firstName, lastName, email];

    if (profilePhotoPath) params.push(profilePhotoPath);
    if (appointmentLetterPath) params.push(appointmentLetterPath);
    params.push(userId);

    db.query(query.replace(/,\s*$/, ''), params, (err) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Error updating data' });
        }

        const addressQuery = `
            UPDATE addresses 
            SET companyAddress = ?, companyCity = ?, companyState = ?, companyZip = ?, homeAddress = ?, homeCity = ?, homeState = ?, homeZip = ?
            WHERE userId = ?
        `;

        db.query(addressQuery, [companyAddress, companyCity, companyState, companyZip, homeAddress, homeCity, homeState, homeZip, userId], (err) => {
            if (err) {
                console.error('Error updating address data:', err);
                return res.status(500).json({ error: 'Error updating address data' });
            }
            res.status(200).json({ message: 'User updated successfully!' });
        });
    });
});


app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [userId], (err: QueryError | null, results: RowDataPacket[]) => {
        if (err) return res.status(500).json({ error: 'Error fetching user data' });

        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const userData = results[0];

        const addressQuery = 'SELECT * FROM addresses WHERE userId = ?';

        db.query(addressQuery, [userId], (err2: QueryError | null, addressResults: RowDataPacket[]) => {
            if (err2) return res.status(500).json({ error: 'Error fetching address data' });

            res.status(200).json({
                ...userData,
                companyAddress: addressResults[0]?.companyAddress,
                companyCity: addressResults[0]?.companyCity,
                companyState: addressResults[0]?.companyState,
                companyZip: addressResults[0]?.companyZip,
                homeAddress: addressResults[0]?.homeAddress,
                homeCity: addressResults[0]?.homeCity,
                homeState: addressResults[0]?.homeState,
                homeZip: addressResults[0]?.homeZip
            });

        });
    });
});

app.put('/api/users/:id', upload.fields([{ name: 'profilePhoto' }, { name: 'appointmentLetter' }]), async (req: any, res: any) => {
    const userId = req.params.id;
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'First Name, Last Name, and Email are mandatory.' });
    }

    const profilePhotoPath = req.files['profilePhoto'] ? req.files['profilePhoto'][0].path : null;
    const appointmentLetterPath = req.files['appointmentLetter'] ? req.files['appointmentLetter'][0].path : null;

    const query = `
        UPDATE users 
        SET firstName = ?, lastName = ?, email = ?${profilePhotoPath ? ', profilePhoto = ?' : ''}${appointmentLetterPath ? ', appointmentLetter = ?' : ''}
        WHERE id = ?
    `;

    const params: any[] = [firstName, lastName, email];

    if (profilePhotoPath) params.push(profilePhotoPath);
    if (appointmentLetterPath) params.push(appointmentLetterPath);
    params.push(userId);

    db.query(query.replace(/,\s*$/, ''), params, (err) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Error updating data' });
        }

        res.status(200).json({ message: 'User updated successfully!' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
