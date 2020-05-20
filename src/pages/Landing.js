import React from 'react';
import './Landing.scss';

/* MATERIAL UI */
// Layout
import Container from '@material-ui/core/Container';

// Inputs
import Button from '@material-ui/core/Button';

function Landing({createNewParty, randomCard, dataIsReady}) {

    return (
        <div className="landing-page">
            <Container maxWidth="xs" className="container">
                <h1>Conversation <br/> Starters</h1>

                <div className="wrapper-button">
                    <Button size="large" disabled={!dataIsReady} fullWidth variant="contained" color="primary" onClick={createNewParty}>
                        Create Room
                    </Button>
                    <Button size="large" disabled={!dataIsReady} fullWidth variant="contained" color="primary" onClick={randomCard}>
                        Random Card
                    </Button>
                </div>
            </Container>
        </div>
    );
}

export default Landing;