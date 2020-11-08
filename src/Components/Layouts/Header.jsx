import React, { Fragment, PureComponent } from "react";
import { NavLink, withRouter } from "react-router-dom";

class Header extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <React.Fragment>
                <header className="site-header">
                    <div className="row">
                        <div className="col-md-3 text-center"><NavLink to="/"><img src={require('../../Assets/images/logo.png')} alt="" /></NavLink></div>
                        <div className="col-md-9">
                            <div className="header_section">
                                Header Section
                            </div>
                        </div>
                    </div>
                </header>
            </React.Fragment>
        );
    }
}

export default Header;