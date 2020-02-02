import * as React from 'react';

export default function Footer() {
    var content = new Date().getFullYear() + ' © Jetcake';
    return (
        <div class="footerstyle">
            <div class="container">
                <div class="row row-centered pos">
                    <div class="col-lg-8 col-xs-12 navbar-brand">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}