import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './EditUser.css';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto: string;
    companyAddress: string;
    companyCity: string;
    companyState: string;
    companyZip: string;
    homeAddress: string;
    homeCity: string;
    homeState: string;
    homeZip: string;
    appointmentLetter: string;
}

const EditUser: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [appointmentLetterFile, setAppointmentLetterFile] = useState<File | null>(null);
    const userId = window.location.pathname.split('/').pop(); // Get the user ID from the URL

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/users/${userId}`);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user:", error);
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('firstName', user!.firstName);
        formData.append('lastName', user!.lastName);
        formData.append('email', user!.email);
        formData.append('companyAddress', user!.companyAddress);
        formData.append('companyCity', user!.companyCity);
        formData.append('companyState', user!.companyState);
        formData.append('companyZip', user!.companyZip);
        formData.append('homeAddress', user!.homeAddress);
        formData.append('homeCity', user!.homeCity);
        formData.append('homeState', user!.homeState);
        formData.append('homeZip', user!.homeZip);

        if (profilePhotoFile) {
            formData.append('profilePhoto', profilePhotoFile);
        }
        if (appointmentLetterFile) {
            formData.append('appointmentLetter', appointmentLetterFile);
        }

        try {
            await axios.put(`http://localhost:5001/api/users/${userId}`, formData);
            alert("User updated successfully!");
            window.location.href = `/view-user/${userId}`;
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (user) {
            setUser({ ...user, [name]: value });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <form onSubmit={handleSubmit} className='main'>
            <h1>Edit User</h1>
            <label>First Name:</label>
            <input type="text" name="firstName" value={user.firstName} onChange={handleChange} required /><br />

            <label>Last Name:</label>
            <input type="text" name="lastName" value={user.lastName} onChange={handleChange} required /><br />

            <label>Email:</label>
            <input type="email" name="email" value={user.email} onChange={handleChange} required /><br />

            <h3>Company Address</h3>
            <label>Address:</label>
            <input type="text" name="companyAddress" value={user.companyAddress} onChange={handleChange} required /><br />

            <label>City:</label>
            <input type="text" name="companyCity" value={user.companyCity} onChange={handleChange} required /><br />

            <label>State:</label>
            <input type="text" name="companyState" value={user.companyState} onChange={handleChange} required /><br />

            <label>ZIP Code:</label>
            <input type="text" name="companyZip" value={user.companyZip} onChange={handleChange} required pattern="\d{6}" title="Must be exactly 6 digits." /><br />

            <h3>Home Address</h3>
            <label>Address:</label>
            <input type="text" name="homeAddress" value={user.homeAddress} onChange={handleChange} required /><br />

            <label>City:</label>
            <input type="text" name="homeCity" value={user.homeCity} onChange={handleChange} required /><br />

            <label>State:</label>
            <input type="text" name="homeState" value={user.homeState} onChange={handleChange} required /><br />

            <label>ZIP Code:</label>
            <input type="text" name="homeZip" value={user.homeZip} onChange={handleChange} required pattern="\d{6}" title="Must be exactly 6 digits." /><br />

            <label>Profile Photo:</label>
            <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => e.target.files && setProfilePhotoFile(e.target.files[0])} /><br />

            <label>Appointment Letter:</label>
            <input type="file" accept=".pdf" onChange={(e) => e.target.files && setAppointmentLetterFile(e.target.files[0])} /><br />

            <button type="submit">Update User</button>
            <button type="button" onClick={() => window.location.href = `/view-user/${userId}`}>Cancel</button>
        </form>
    );
}

export default EditUser;
