/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { api, setAuth } from "../api";
import { TextField, Button, Typography, Box, Link, Paper } from '@mui/material';

export default function Login()
{
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function onSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setAuth(data.token);
            location.href = '/Dashboard'; //Go to dashboard
        }
        catch (err: any) {
            setError(err?.response?.data?.message || "Error while login");
        }
    }
    return (
          <Box sx={{mt:8, textAlign:"center"}}>
        <form onSubmit={onSubmit}>
            <link rel="icon" type="image/png" href="/icons/icon-512x512.png" />
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
                <Typography variant="h5" gutterBottom>Login</Typography>

                <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
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
                    Ingresar
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                <Typography sx={{ mt: 2 }}>
                    Don't have an account?{' '}
                    <Link href="/Register" underline="hover">
                        Register!
                    </Link>
                </Typography>
            </Paper>
        </form>
    </Box>
    );
}