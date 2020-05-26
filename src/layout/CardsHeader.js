import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import { StateContext, DispatchContext } from '../Context/GlobalContext';

/* MATERIAL UI */
// Styles
import { makeStyles } from '@material-ui/core/styles';

// Layout
import Container from '@material-ui/core/Container';

// Inputs
import Button from '@material-ui/core/Button';

// Navigation
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

// Surfaces
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

// Data Display
import HomeIcon from '@material-ui/icons/Home';
import LanguageIcon from '@material-ui/icons/Language';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'space-between'
    }
}));

function Header() {
    const classes = useStyles();
    const history = useHistory();

    const {languages} = useContext(StateContext);
    const {dispatchLanguages} = useContext(DispatchContext);
    const [anchorEl, setAnchorEl] = React.useState();

    function handleLanguageClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleLanguageClose() {
        setAnchorEl(null);
    }
    
    function handleMenuSelect(event) {
        const { languageId } = event.currentTarget.dataset;
        dispatchLanguages({type: 'CURRENT', payload: languageId})
        setAnchorEl(null);
    }

    function createMenuItems() {
        const menuItems = [];

        for (const languageID in languages.actives) {
            menuItems.push(
                <MenuItem onClick={handleMenuSelect} data-language-id={languageID} key={languageID}>
                    <span style={{ textTransform: 'uppercase', marginRight: '0.5em' }}>{languageID}</span>
                    <span>{languages.all && languages.all[languageID] && languages.all[languageID].nativeName}</span>
                </MenuItem>
            );
        }

        return menuItems;
    }


    return (
        <AppBar position="static">
            <Toolbar>
                <Container maxWidth="xs" className={classes.container}>
                    <Button color="inherit" aria-label="menu" onClick={() => history.push('/')}>
                        <HomeIcon />
                    </Button>
                    <Button edge="start" color="inherit" aria-label="menu" onClick={handleLanguageClick}>
                        <LanguageIcon /><span style={{marginLeft: '0.4em'}}>{languages.current}</span>
                    </Button>
                    <Menu
                      id="languageSelector"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleLanguageClose}
                      
                    >
                        {createMenuItems()}
                    </Menu>
                </Container>
                
            </Toolbar>
        </AppBar>
    );
}

export default Header;
