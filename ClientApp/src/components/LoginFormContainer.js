import React, { Component } from 'react';
import { Redirect, withRouter  } from 'react-router';
import { validateToken } from './TokenValidator'
/* Import Components */
import Input from './Input';
import { ApplicationState } from '../store';
import * as NavigationStore from '../store/Navigation';
import { connect } from 'react-redux';

class LoginFormContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newUser: {
                Username: '',
                Password: ''
            },
            errors: {
                Username: '',
                Password: ''
            },
            response: ''
        }
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validate = this.validate.bind(this);
    }
    handleFormSubmit(event) {
        event.preventDefault();
        let isValid = this.validate(this.state.newUser);
        if (isValid) {
            let newUser = { ...this.state.newUser }; 
            var formData = new FormData();

            for (var key in newUser) {
                formData.append(key, newUser[key]);
            }

            fetch('/api/Login', {
                method: "POST",
                body: formData
            })
                .then(response => {
                    const callback = (validated) => {
                        if (validated) {
                            this.props.changeAuthenticated(true);
                            this.props.history.push('/profile');
                        }

                        let responseString = validated ? 'Success!' : 'Invalid credentials!'

                        this.setState(state => {
                            state.response = responseString
                            return state
                        });
                    }
                    //generate token and current user information
                    response.text().then(function (result) {
                        var userInfo = JSON.parse(result);
                        validateToken(userInfo, callback);
                    });

                })
        }
    }
    handleChange(event) {
        const { name, value } = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'Password':
                errors.Password =
                    value.trim().length < 7
                        ? 'Password must contain at least 6 characters!'
                        : '';
                break;
            default:
                errors[name] =
                    value.trim().length < 1
                        ? name + ' cannot be blank!'
                        : '';
                break;
        }
        this.setState(state => {
            state.newUser[name] = value
            state.errors = errors
            return state
        })
    }
    validate(newUser) {
        let errors = this.state.errors,
            valid = true;

        for (var prop in newUser) {
            if (Object.prototype.hasOwnProperty.call(newUser, prop)) {
                var value = newUser[prop];
                switch (prop) {
                    case 'Password':
                        errors.Password =
                            value.trim().length < 7
                                ? 'Password must contain at least 6 characters!'
                                : '';
                        break;
                    default:
                        var trimmed = prop !== 'ProfileImage' ? value.trim() : value;
                        errors[prop] =
                            trimmed.length < 1
                                ? prop + ' cannot be blank!'
                                : '';
                        break;
                }
                valid = valid ? errors[prop].length === 0 : false;
            }
        }

        this.setState(state => {
            state.errors = errors
            return state
        })
        return valid;
    }
    render() {
        return (
            <form onSubmit={this.handleFormSubmit} encType="multipart/form-data">
                <Input type={'text'}
                    title={'Username'}
                    name={'Username'}
                    value={this.state.newUser.Username}
                    error={this.state.errors.Username}
                    placeholder={'Enter Username'}
                    handleChange={this.handleChange}
                />
                <Input type={'password'}
                    title={'Password'}
                    name={'Password'}
                    value={this.state.newUser.Password}
                    error={this.state.errors.Password}
                    placeholder={'Enter Password'}
                    handleChange={this.handleChange}
                />
                <input type="submit" value="Login" />
                <br/>
                <div style={{ color: this.state.response === 'Success!' ? "Green" : "Red"}}> {this.state.response} </div>
            </form>
        );
    }
}
export default connect(
    (state) => state.navigation,
    NavigationStore.actionCreators // Selects which action creators are merged into the component's props
)(LoginFormContainer);