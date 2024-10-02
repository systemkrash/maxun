import React, { useState } from 'react';
import { styled } from '@mui/system';
import { TextField, Button, Switch, FormControlLabel, Box, Typography } from '@mui/material';
import { sendProxyConfig } from '../../api/proxy';
import { useGlobalInfoStore } from '../../context/globalInfo';

const FormContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    borderRadius: '8px',
});

const FormControl = styled(Box)({
    marginBottom: '16px',
});

const ProxyForm: React.FC = () => {
    const [proxyConfig, setProxyConfig] = useState({
        server_url: '',
        username: '',
        password: '',
    });
    const [requiresAuth, setRequiresAuth] = useState<boolean>(false);
    const [errors, setErrors] = useState({
        server_url: '',
        username: '',
        password: '',
    });

    const { notify } = useGlobalInfoStore();

    const validateForm = () => {
        let valid = true;
        let errorMessages = { server_url: '', username: '', password: '' };

        if (!proxyConfig.server_url) {
            errorMessages.server_url = 'Server URL is required';
            valid = false;
        }

        if (requiresAuth) {
            if (!proxyConfig.username) {
                errorMessages.username = 'Username is required for authenticated proxies';
                valid = false;
            }
            if (!proxyConfig.password) {
                errorMessages.password = 'Password is required for authenticated proxies';
                valid = false;
            }
        }

        setErrors(errorMessages);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProxyConfig({ ...proxyConfig, [name]: value });
    };

    const handleAuthToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRequiresAuth(e.target.checked);
        if (!e.target.checked) {
            setProxyConfig({ ...proxyConfig, username: '', password: '' });
            setErrors({ ...errors, username: '', password: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        await sendProxyConfig(proxyConfig).then((response) => {
            if (response) {
                notify('success', 'Proxy configuration submitted successfully');
            } else {
                notify('error', 'Failed to submit proxy configuration. Try again.');
            }
        });
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <Typography variant="subtitle1" gutterBottom style={{ marginBottom: '20px', marginTop: '20px' }}>
                    Proxy Configuration
                </Typography>
                <FormControl>
                    <TextField
                        label="Proxy Server URL"
                        name="server_url"
                        value={proxyConfig.server_url}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.server_url}
                        helperText={errors.server_url || 'e.g., http://proxy-server.com:8080'}
                    />
                </FormControl>
                <FormControl>
                    <FormControlLabel
                        control={<Switch checked={requiresAuth} onChange={handleAuthToggle} />}
                        label="Requires Authentication?"
                    />
                </FormControl>
                {requiresAuth && (
                    <>
                        <FormControl>
                            <TextField
                                label="Username"
                                name="username"
                                value={proxyConfig.username}
                                onChange={handleChange}
                                fullWidth
                                required={requiresAuth}
                                error={!!errors.username}
                                helperText={errors.username || ''}
                            />
                        </FormControl>
                        <FormControl>
                            <TextField
                                label="Password"
                                name="password"
                                value={proxyConfig.password}
                                onChange={handleChange}
                                type="password"
                                fullWidth
                                required={requiresAuth}
                                error={!!errors.password}
                                helperText={errors.password || ''}
                            />
                        </FormControl>
                    </>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={!proxyConfig.server_url || (requiresAuth && (!proxyConfig.username || !proxyConfig.password))}
                >
                    Add Proxy
                </Button>
            </form>
        </FormContainer>
    );
};

export default ProxyForm;