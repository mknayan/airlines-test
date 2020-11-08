import React, { Fragment, Component } from "react";
import { AJAX_PUBLIC_REQUEST, SET_STORAGE, GET_STORAGE, APP_VERSION } from "./Constants/AppConstants";
import { Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css';
import "font-awesome/css/font-awesome.min.css";
import "./Assets/css/bootstrap.min-v4.1.3.css";
import "./Assets/css/styles.css";

import $ from "jquery";

import "popper.js";
import "bootstrap/dist/js/bootstrap.min.js";

import Downtime from "./Components/Pages/Downtime";
import Header from "./Components/Layouts/Header";
import Footer from "./Components/Layouts/Footer";
import CommonRoutes from "./Routes/CommonRoutes";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            downtime: false,
            downtime_msg:
                "<h3>Down for maintenance</h3><p>Site is temporarily unavailable due to planned maintenance.</p>"
        };
        console.log('App Version: ' + APP_VERSION);
    }

    componentDidMount() {
        this.setState({ loading: false });
    }

    disableDowntime = () => {
        this.setState({ downtime: false })
    }

    render() {
        const cur_url = window.location.href;
        return (
            <Fragment>
                {this.state.downtime ? (
                    <Downtime downtime_msg={this.state.downtime_msg} disableDowntime={this.disableDowntime} />
                ) : (
                        <Fragment>
                            {this.state.loading ? (
                                <div className="home-loading" ></div>
                            ) : (
                                    <Fragment>
                                        <div className="container">
                                            <Header />
                                            <ToastContainer />
                                            <div className="site-wrapper">
                                                <CommonRoutes />
                                            </div>
                                            <Footer />
                                        </div>
                                    </Fragment>
                                )}
                        </Fragment>
                    )}
            </Fragment>
        );
    }
}

export default App;
