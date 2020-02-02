import * as React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { validateToken } from './TokenValidator'
import './NavMenu.css';
import { ApplicationState } from '../store';
import * as NavigationStore from '../store/Navigation';
import { connect } from 'react-redux';

// At runtime, Redux will merge together...
type NavigationProps =
    NavigationStore.NavigationState // ... state we've requested from the Redux store
    & typeof NavigationStore.actionCreators // ... plus action creators we've requested
    & RouteComponentProps<{ startDateIndex: string }>; // ... plus incoming routing parameters

class NavMenu extends React.PureComponent<NavigationProps> {

    public state = {
        isOpen: false
    };

    componentDidUpdate() {
        this.validateToken();
    }

    componentDidMount() {
        this.validateToken();     
    }

    validateToken() {
        const callback = (authenticated) => {
            this.props.changeAuthenticated(authenticated);
        }
        var token = { token: localStorage.getItem('token') };
        validateToken(token, callback);
    }

    public render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">Jetcake</NavbarBrand>
                        <NavbarToggler onClick={this.toggle} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={this.state.isOpen} navbar>
                            <ul className="navbar-nav flex-grow">
                                {this.props.authenticated ? (<NavItem>
                                    <NavLink tag={Link} className="text-dark" onClick={this.logout} to={{
                                        pathname: '/'
                                    }} >Logout</NavLink>
                                </NavItem>)
                                    : (<NavItem>
                                        <NavLink tag={Link} className="text-dark" to={{
                                            pathname: '/login'
                                        }}>Login</NavLink>
                                    </NavItem>)}

                                {this.props.authenticated ? (<NavItem>
                                    <NavLink tag={Link} className="text-dark" to={{
                                        pathname: '/profile'
                                    }}>Profile</NavLink>
                                </NavItem>)
                                    : (<NavItem>
                                        <NavLink tag={Link} className="text-dark" to={{
                                            pathname: '/register'
                                        }}>Register</NavLink>
                                    </NavItem>)}

                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    private logout = (event) => {
        event.preventDefault();
        localStorage.clear();
        this.props.changeAuthenticated(false);
        this.props.history.push('/');
    }
}

export default withRouter(connect(
    (state: ApplicationState) => state.navigation, // Selects which state properties are merged into the component's props
    NavigationStore.actionCreators // Selects which action creators are merged into the component's props
)(NavMenu as any));
