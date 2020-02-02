import * as React from 'react';
import { Route, Redirect } from 'react-router';
import Layout from './components/Layout';
import FormContainer from './components/FormContainer';
import LoginFormContainer from './components/LoginFormContainer';
import './custom.css'

export default () => (
    <Layout>
        <ProtectedRoute shouldBeAuthenticated={false}
            path='/(|login)' component={LoginFormContainer}
        />
        <Route path='/register' component={FormContainer} />
        <ProtectedRoute shouldBeAuthenticated={true}
            path='/profile'
            component={(props) => <FormContainer {...props} isAuthenticated={true} />}
        />
    </Layout>
);
//forbid access to /profile if unauthorized and forbid access to /,/login if authorized
const ProtectedRoute = ({ shouldBeAuthenticated: shouldBeAuthenticated, component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            shouldBeAuthenticated ? localStorage.getItem("token") ? (
                <Component {...props} />
            ) : (
                    <Redirect
                        to={{
                            pathname: "/login"
                        }}
                    />
                ) :
                !localStorage.getItem("token") ? (
                    <Component {...props} />
                ) : (
                        <Redirect
                            to={{
                                pathname: "/profile"
                            }}
                        />
                    )

        }
    />
);
