"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var reactstrap_1 = require("reactstrap");
var NavMenu_1 = require("./NavMenu");
var Footer_1 = require("./Footer");
exports.default = (function (props) { return (React.createElement(React.Fragment, null,
    React.createElement(NavMenu_1.default, null),
    React.createElement(reactstrap_1.Container, null, props.children),
    React.createElement(Footer_1.default, null))); });
//# sourceMappingURL=Layout.js.map