"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var reactstrap_1 = require("reactstrap");
var react_router_dom_1 = require("react-router-dom");
var TokenValidator_1 = require("./TokenValidator");
require("./NavMenu.css");
var NavigationStore = require("../store/Navigation");
var react_redux_1 = require("react-redux");
var NavMenu = /** @class */ (function (_super) {
    __extends(NavMenu, _super);
    function NavMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isOpen: false
        };
        _this.toggle = function () {
            _this.setState({
                isOpen: !_this.state.isOpen
            });
        };
        _this.logout = function (event) {
            event.preventDefault();
            localStorage.clear();
            _this.props.changeAuthenticated(false);
            _this.props.history.push('/');
        };
        return _this;
    }
    NavMenu.prototype.componentDidUpdate = function () {
        this.validateToken();
    };
    NavMenu.prototype.componentDidMount = function () {
        this.validateToken();
    };
    NavMenu.prototype.validateToken = function () {
        var _this = this;
        var callback = function (authenticated) {
            _this.props.changeAuthenticated(authenticated);
        };
        var token = { token: localStorage.getItem('token') };
        TokenValidator_1.validateToken(token, callback);
    };
    NavMenu.prototype.render = function () {
        return (React.createElement("header", null,
            React.createElement(reactstrap_1.Navbar, { className: "navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3", light: true },
                React.createElement(reactstrap_1.Container, null,
                    React.createElement(reactstrap_1.NavbarBrand, { tag: react_router_dom_1.Link, to: "/" }, "Jetcake"),
                    React.createElement(reactstrap_1.NavbarToggler, { onClick: this.toggle, className: "mr-2" }),
                    React.createElement(reactstrap_1.Collapse, { className: "d-sm-inline-flex flex-sm-row-reverse", isOpen: this.state.isOpen, navbar: true },
                        React.createElement("ul", { className: "navbar-nav flex-grow" },
                            this.props.authenticated ? (React.createElement(reactstrap_1.NavItem, null,
                                React.createElement(reactstrap_1.NavLink, { tag: react_router_dom_1.Link, className: "text-dark", onClick: this.logout, to: {
                                        pathname: '/'
                                    } }, "Logout")))
                                : (React.createElement(reactstrap_1.NavItem, null,
                                    React.createElement(reactstrap_1.NavLink, { tag: react_router_dom_1.Link, className: "text-dark", to: {
                                            pathname: '/login'
                                        } }, "Login"))),
                            this.props.authenticated ? (React.createElement(reactstrap_1.NavItem, null,
                                React.createElement(reactstrap_1.NavLink, { tag: react_router_dom_1.Link, className: "text-dark", to: {
                                        pathname: '/profile'
                                    } }, "Profile")))
                                : (React.createElement(reactstrap_1.NavItem, null,
                                    React.createElement(reactstrap_1.NavLink, { tag: react_router_dom_1.Link, className: "text-dark", to: {
                                            pathname: '/register'
                                        } }, "Register")))))))));
    };
    return NavMenu;
}(React.PureComponent));
exports.default = react_router_dom_1.withRouter(react_redux_1.connect(function (state) { return state.navigation; }, // Selects which state properties are merged into the component's props
NavigationStore.actionCreators // Selects which action creators are merged into the component's props
)(NavMenu));
//# sourceMappingURL=NavMenu.js.map