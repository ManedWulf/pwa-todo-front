/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { api, setAuth } from "../api";
import { TextField, Button, Typography, Box, Link, Paper } from '@mui/material';

export default function Register()
{
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function onSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('token', data.token);
            setAuth(data.token);
            location.href = '/Dashboard'; //Go to dashboard
        }
        catch (err: any) {
            setError(err?.response?.data?.message || "Error while register" + err?.response?.data?.message);
        }
    }
    return (

        <Box sx={{ mt: 8, textAlign: "center" }}>
             <form onSubmit={onSubmit}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
                <Typography variant="h5" gutterBottom>Register</Typography>

                <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    margin="normal"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    type="submit"
                >
                    Register
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                <Typography sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link href="/Login" underline="hover">
                        Log in!
                    </Link>
                </Typography>
            </Paper>
            </form>
        </Box>
    );
}