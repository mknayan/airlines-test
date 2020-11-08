import React, { Component, Fragment } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { SET_COOKIE } from "../Constants/AppConstants";

// PublicSite Start
import Home from "../Components/Selise/Home";
import PageNotFound from "../Components/Pages/PageNotFound";

class CommonRoutes extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path="/" component={Home} exact strict />
                <Route component={PageNotFound} exact strict />
            </Switch>
        );
    }
}

export default withRouter(CommonRoutes);