import React, { Component } from 'react';

/* Import Components */
import Input from './Input';
import { validateToken } from './TokenValidator'

export default class FormContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newUser: this.props.isAuthenticated ?
                JSON.parse(localStorage.getItem('currentUser')) :
                {
                    username: '',
                    password: '',
                    phoneNumber: '',
                    address: '',
                    email: '',
                    dateOfBirth: '',
                    questionOne: '',
                    questionTwo: '',
                    questionThree: '',
                    profileImage: '' 
                },
            errors: {
                username: '',
                password: '',
                phoneNumber: '',
                address: '',
                email: '',
                dateOfBirth: '',
                questionOne: '',
                questionTwo: '',
                questionThree: '',
                profileImage: ''
            },
            image: '',
            response: ''
        }
        if (props.isAuthenticated) {
            if (this.state.newUser.dateOfBirth) {
                var date = new Date(this.state.newUser.dateOfBirth);
                var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
                this.state.newUser.dateOfBirth =
                    date.getFullYear() + "-" + month + "-" + date.getDate();
            }
            var image = this.state.newUser.profileImageEntity;
            if (image) {
                var imageTitle = image.imageTitle;
                var ext = imageTitle ? imageTitle.substr(imageTitle.lastIndexOf('.') + 1) : '';
                this.state.image = 'data:image/' + ext + ';base64,' + image.imageData;
            }
        }
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeImage = this.handleChangeImage.bind(this);
        this.setResponseMessage = this.setResponseMessage.bind(this);
        this.validate = this.validate.bind(this);
        this.mailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        this.phoneFormat = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    }

    handleFormSubmit(event) {
        event.preventDefault();
        let isValid = this.validate(this.state.newUser);
        if (isValid) {
            let newUser = { ...this.state.newUser };

            var endpoint = this.props.isAuthenticated ? 'api/Users/' + this.state.newUser.id : 'api/Users';
            var method = this.props.isAuthenticated ? 'PUT' : 'POST';
            var formData = new FormData();

            for (var key in newUser) {
                formData.append(key, newUser[key]);
            }
            
            fetch(endpoint, {
                method: method,
                body: formData
            }).then(response => {
                //handling update response
                if (this.props.isAuthenticated) {
                    const callback = (validated) => {
                        if (validated) {
                        }

                        let responseString = validated ? 'Success!' : 'Invalid credentials!'

                        this.setResponseMessage(responseString);
                    }
                    //refresh token and current user information
                    response.text().then(function (result) {
                        var userInfo = JSON.parse(result);
                        validateToken(userInfo, callback);
                    });
                }
                //handling create response
                else {
                    const callback = this.setResponseMessage;
                    response.text().then(function (result) {
                        let responseMsg = '';
                        if (result) {
                            responseMsg = JSON.parse(result);
                        }
                        else {
                            responseMsg = response.ok ? 'Success!' : 'Failed to create!';
                        }
                        callback(responseMsg);
                    });
                    
                }
            })
        }
    }
    handleChange(event) {
        const { name, value } = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'password':
                errors.password =
                    value.trim().length < 7
                        ? 'password must contain at least 6 characters!'
                        : '';
                break;
            case 'phoneNumber':
                errors.phoneNumber = this.phoneFormat.test(value.trim())
                    ? ''
                    : 'Please enter valid 10 digit phone number';
                break;
            case 'email':
                errors.email = this.mailFormat.test(value.trim())
                    ? ''
                    : 'Please enter valid e-mail address';
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
    handleChangeImage(event) {
        let image = event.target.files[0];
        this.setState(state => {
            state.newUser.profileImage = image
            return state
        })
        if (this.validateFile(image)) {
            this.setState(state => {
                state.newUser.profileImage = image
                state.image = URL.createObjectURL(image)
                state.errors.profileImage = ''
                return state
            })
        }
        else {
            this.setState(state => {
                state.errors.profileImage = 'The selected file format is not correct.'
                return state
            })
        }
        
    }
    validateFile(file) {
        if (!file) return false;
        var allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
        var fileExtension = file.name.split('.').pop().toLowerCase();
        var isValidFile = false;

        for (var index in allowedExtension) {

            if (fileExtension === allowedExtension[index]) {
                isValidFile = true;
                break;
            }
        }

        return isValidFile;
    }
    validate(newUser) {
        let errors = this.state.errors,
            valid = true,
            excludedProps = ["id", "profileImage", "profileImageEntity", "profileImageEntityId"];

        for (var prop in newUser) {
            if (Object.prototype.hasOwnProperty.call(newUser, prop)) {
                var value = newUser[prop];
                switch (prop) {
                    case 'password':
                        errors.password =
                            value.trim().length < 7
                                ? 'password must contain at least 6 characters!'
                                : '';
                        break;
                    case 'phoneNumber':
                        errors.phoneNumber = this.phoneFormat.test(value.trim())
                            ? ''
                            : 'Please enter valid 10 digit phone number';
                        break;
                    case 'email':
                        errors.email = this.mailFormat.test(value.trim())
                            ? ''
                            : 'Please enter valid e-mail address';
                        break;
                    case 'profileImage':
                        if (!this.props.isAuthenticated) {
                            errors.profileImage = value ? this.validateFile(value)
                                ? ''
                                : 'The selected file format is not correct.' : 'Please choose profile image';
                        }
                        break;
                    default:
                        var trimmed = !excludedProps.includes(prop) ? value.trim() : value;
                        if (trimmed !== null) {
                            errors[prop] =
                                trimmed.length < 1
                                    ? prop + ' cannot be blank!'
                                    : '';
                        }
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
    setResponseMessage(msg) {
        this.setState(state => {
            state.response = msg
            return state
        })
    }
    render() {
        return (
            <form onSubmit={this.handleFormSubmit} encType="multipart/form-data">
                <Input type={'text'}
                    title={'Username'}
                    name={'username'}
                    value={this.state.newUser.username}
                    error={this.state.errors.username}
                    placeholder={'Enter username'}
                    handleChange={this.handleChange}
                />
                <Input type={'password'}
                    title={'Password'}
                    name={'password'}
                    value={this.state.newUser.password}
                    error={this.state.errors.password}
                    placeholder={'Enter password'}
                    handleChange={this.handleChange}
                />
                <Input type={'email'}
                    title={'Email'}
                    name={'email'}
                    value={this.state.newUser.email}
                    error={this.state.errors.email}
                    placeholder={'Enter email'}
                    handleChange={this.handleChange}
                />
                <Input type={'text'}
                    title={'Phone number'}
                    name={'phoneNumber'}
                    value={this.state.newUser.phoneNumber}
                    error={this.state.errors.phoneNumber}
                    placeholder={'Enter phone number'}
                    handleChange={this.handleChange}
                />
                <Input type={'text'}
                    title={'Address'}
                    name={'address'}
                    value={this.state.newUser.address}
                    error={this.state.errors.address}
                    placeholder={'Enter address'}
                    handleChange={this.handleChange}
                />
                <Input type={'date'}
                    title={'Date of birth'}
                    name={'dateOfBirth'}
                    value={this.state.newUser.dateOfBirth}
                    error={this.state.errors.dateOfBirth}
                    placeholder={'Enter date of birth'}
                    handleChange={this.handleChange}
                />
                <Input type={'text'}
                    title={"What's your favorite movie"}
                    name={'questionOne'}
                    value={this.state.newUser.questionOne}
                    error={this.state.errors.questionOne}
                    placeholder={'Answer question one'}
                    handleChange={this.handleChange}
                />
                <Input type={'text'}
                    title={"What's your favorite web application"}
                    name={'questionTwo'}
                    value={this.state.newUser.questionTwo}
                    error={this.state.errors.questionTwo}
                    placeholder={'Answer question two'}
                    handleChange={this.handleChange}
                />
                <Input type={'text'}
                    title={"What's your nickname"}
                    name={'questionThree'}
                    value={this.state.newUser.questionThree}
                    error={this.state.errors.questionThree}
                    placeholder={'Answer question three'}
                    handleChange={this.handleChange}
                />
                <Input type={'file'}
                    title={"Upload profile picture"}
                    name={'profileImage'}
                    error={this.state.errors.profileImage}
                    handleChange={this.handleChangeImage}
                    accept={"image/*"}
                />
                <img src={this.state.image} />
                <br />
                <input type="submit" value={this.props.isAuthenticated ? 'Update profile' : 'Register new account'} />
                <div style={{ color: this.state.response === 'Success!' ? "Green" : "Red" }}> {this.state.response} </div>
            </form>
        );
    }
}
