import React from 'react';
import './Card.scss';

/* COMPONENTS */
import DialogHelp from './DialogHelp';
import DialogSettings from './DialogSettings';

/* MATERIAL UI */

// Styles
import { makeStyles } from '@material-ui/core/styles';

// Layout
import Container from '@material-ui/core/Container'

// Surfaces
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

// Data Display
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/Help';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
    flex: {
        display: 'flex',
        alignItems: 'center',
    },
    flexGrow: {
        flexGrow: 1,
    },
    capitalize: {
        textTransform: 'capitalize',
        textAlign: 'center'
    }
}));


function CardComponent({question, title, help}) {
    const classes = useStyles();

    return (
        <div className="card-component">
            <Card className={classes.root}>
                <CardHeader
                    classes={{title: classes.flex}}
                    title={
                        <>
                            <DialogSettings />
                            <Typography variant="h5" className={`${classes.capitalize} ${classes.flexGrow}`}>
                                {title 
                                    ? title
                                    : <Skeleton animation="wave" width="60%" height="1em" style={{margin: "0 auto"}}/>
                                }
                            </Typography>
                            <DialogHelp Icon={HelpIcon}>
                                <Container maxWidth="sm">
                                    { help }
                                </Container>
                            </DialogHelp>
                        </>
                    }
                />
                <CardContent>
                    <Typography variant="body2" color="textSecondary" component="div">
                        {question
                            ? <div dangerouslySetInnerHTML={{ __html: question }}></div>
                            :  <>
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                            </>
                        }
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
}

export default CardComponent;