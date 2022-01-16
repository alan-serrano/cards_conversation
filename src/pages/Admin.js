import React from 'react';
import { useHistory } from 'react-router-dom';
import './Admin.scss';

/* MATERIAL UI */

// Layout
import Container from '@material-ui/core/Container';

// Inputs
import Button from '@material-ui/core/Button';

function Admin() {
    const history = useHistory();
    return (
        <div className="admin-page">
            <Container maxWidth="xs" className="container">
                <h1>Admin <br/> Cards</h1>

                <div className="wrapper-button">
                    <Button size="large" fullWidth variant="contained" color="primary" onClick={() => history.push('/edit')}>
                        Cards
                    </Button>
                    <Button size="large" fullWidth variant="contained" color="primary" onClick={() => history.push('/edit')}>
                        Groups
                    </Button>
                    <Button size="large" fullWidth variant="contained" color="primary" onClick={() => history.push('/')}>
                        Home
                    </Button>
                </div>
            </Container>
        </div>
    );
}

export default Admin;